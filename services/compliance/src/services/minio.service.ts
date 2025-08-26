import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { createHash } from 'crypto';
import { Readable } from 'stream';

export interface UploadResult {
  objectName: string;
  etag: string;
  versionId?: string;
  size: number;
  hash: string;
  url: string;
}

export interface DocumentMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  hash: string;
  tags?: Record<string, string>;
}

@Injectable()
export class MinIOService {
  private readonly logger = new Logger(MinIOService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get('MINIO_PORT', 9000),
      useSSL: this.configService.get('MINIO_USE_SSL', false),
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET', 'aimy-compliance');
    this.baseUrl = this.configService.get('MINIO_BASE_URL', 'http://localhost:9000');

    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);

        // Set bucket policy for private access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Deny',
              Principal: { AWS: '*' },
              Action: 's3:*',
              Resource: `arn:aws:s3:::${this.bucketName}/*`,
              Condition: {
                StringNotEquals: {
                  'aws:PrincipalArn': 'arn:aws:iam::*:user/*',
                },
              },
            },
          ],
        };

        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Set private policy for bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize MinIO bucket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a document to MinIO
   */
  async uploadDocument(
    file: Express.Multer.File,
    applicantId: string,
    documentType: string,
    metadata?: Partial<DocumentMetadata>,
  ): Promise<UploadResult> {
    try {
      // Validate file
      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file');
      }

      // Generate file hash
      const hash = createHash('sha256').update(file.buffer).digest('hex');

      // Generate object name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const objectName = `${applicantId}/${documentType}/${timestamp}-${file.originalname}`;

      // Prepare metadata
      const documentMetadata: DocumentMetadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        hash,
        tags: {
          applicantId,
          documentType,
          uploadTimestamp: timestamp,
          ...metadata?.tags,
        },
      };

      // Upload to MinIO
      const etag = await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'x-amz-meta-original-name': file.originalname,
          'x-amz-meta-hash': hash,
          'x-amz-meta-applicant-id': applicantId,
          'x-amz-meta-document-type': documentType,
          'x-amz-meta-upload-timestamp': timestamp,
        },
      );

      this.logger.log(`Document uploaded successfully: ${objectName}`);

      return {
        objectName,
        etag,
        size: file.size,
        hash,
        url: `${this.baseUrl}/${this.bucketName}/${objectName}`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a document from a stream
   */
  async uploadDocumentFromStream(
    stream: Readable,
    objectName: string,
    size: number,
    metadata: DocumentMetadata,
  ): Promise<UploadResult> {
    try {
      const etag = await this.minioClient.putObject(
        this.bucketName,
        objectName,
        stream,
        size,
        {
          'Content-Type': metadata.mimeType,
          'x-amz-meta-original-name': metadata.originalName,
          'x-amz-meta-hash': metadata.hash,
          'x-amz-meta-size': metadata.size.toString(),
        },
      );

      this.logger.log(`Document uploaded from stream successfully: ${objectName}`);

      return {
        objectName,
        etag,
        size,
        hash: metadata.hash,
        url: `${this.baseUrl}/${this.bucketName}/${objectName}`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload document from stream: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download a document from MinIO
   */
  async downloadDocument(objectName: string): Promise<{ stream: Readable; metadata: any }> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectName);
      const metadata = await this.minioClient.statObject(this.bucketName, objectName);

      return { stream, metadata };
    } catch (error) {
      this.logger.error(`Failed to download document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(objectName: string): Promise<any> {
    try {
      return await this.minioClient.statObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`Failed to get document metadata: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate presigned URL for document access
   */
  async getPresignedUrl(
    objectName: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiresIn);
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a document from MinIO
   */
  async deleteDocument(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Document deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete document: ${error.message}`);
      throw error;
    }
  }

  /**
   * List documents for an applicant
   */
  async listApplicantDocuments(applicantId: string): Promise<any[]> {
    try {
      const objects: any[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, `${applicantId}/`, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          objects.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.etag,
          });
        });

        stream.on('error', reject);
        stream.on('end', () => resolve(objects));
      });
    } catch (error) {
      this.logger.error(`Failed to list applicant documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Copy a document to a new location
   */
  async copyDocument(
    sourceObjectName: string,
    destinationObjectName: string,
  ): Promise<void> {
    try {
      await this.minioClient.copyObject(
        this.bucketName,
        destinationObjectName,
        `${this.bucketName}/${sourceObjectName}`,
      );
      this.logger.log(`Document copied successfully: ${sourceObjectName} -> ${destinationObjectName}`);
    } catch (error) {
      this.logger.error(`Failed to copy document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a document exists
   */
  async documentExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get document size
   */
  async getDocumentSize(objectName: string): Promise<number> {
    try {
      const metadata = await this.minioClient.statObject(this.bucketName, objectName);
      return metadata.size;
    } catch (error) {
      this.logger.error(`Failed to get document size: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate file hash
   */
  async validateDocumentHash(objectName: string, expectedHash: string): Promise<boolean> {
    try {
      const metadata = await this.minioClient.statObject(this.bucketName, objectName);
      const storedHash = metadata.metaData?.['x-amz-meta-hash'];
      return storedHash === expectedHash;
    } catch (error) {
      this.logger.error(`Failed to validate document hash: ${error.message}`);
      return false;
    }
  }

  /**
   * Get bucket statistics
   */
  async getBucketStats(): Promise<{ size: number; count: number }> {
    try {
      let totalSize = 0;
      let totalCount = 0;
      const stream = this.minioClient.listObjects(this.bucketName, '', true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          totalSize += obj.size;
          totalCount++;
        });

        stream.on('error', reject);
        stream.on('end', () => resolve({ size: totalSize, count: totalCount }));
      });
    } catch (error) {
      this.logger.error(`Failed to get bucket stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up expired documents
   */
  async cleanupExpiredDocuments(expirationDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - expirationDays);

      let deletedCount = 0;
      const stream = this.minioClient.listObjects(this.bucketName, '', true);

      return new Promise((resolve, reject) => {
        stream.on('data', async (obj) => {
          if (obj.lastModified < cutoffDate) {
            try {
              await this.minioClient.removeObject(this.bucketName, obj.name);
              deletedCount++;
            } catch (error) {
              this.logger.warn(`Failed to delete expired document: ${obj.name}`);
            }
          }
        });

        stream.on('error', reject);
        stream.on('end', () => {
          this.logger.log(`Cleaned up ${deletedCount} expired documents`);
          resolve(deletedCount);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup expired documents: ${error.message}`);
      throw error;
    }
  }
}
