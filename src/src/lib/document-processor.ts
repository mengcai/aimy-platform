interface ProcessingOptions {
  extractText?: boolean;
  extractMetadata?: boolean;
  generateEmbeddings?: boolean;
  chunkSize?: number;
  overlapSize?: number;
  language?: string;
  preserveFormatting?: boolean;
}

interface ProcessedDocument {
  id: string;
  originalContent: string;
  processedContent: string;
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
  embeddings: number[][];
  processingTime: number;
  status: 'success' | 'failed' | 'partial';
  error?: string;
}

interface DocumentChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, any>;
  embedding?: number[];
}

interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  documentType?: string;
  tags?: string[];
  extractedEntities?: ExtractedEntity[];
  summary?: string;
}

interface ExtractedEntity {
  type: 'person' | 'organization' | 'location' | 'date' | 'amount' | 'percentage';
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export class DocumentProcessor {
  private defaultOptions: ProcessingOptions = {
    extractText: true,
    extractMetadata: true,
    generateEmbeddings: true,
    chunkSize: 1000,
    overlapSize: 200,
    language: 'en',
    preserveFormatting: false,
  };

  constructor(options?: Partial<ProcessingOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  async processDocument(
    content: string | Buffer,
    options: ProcessingOptions = {}
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    const processingOptions = { ...this.defaultOptions, ...options };

    try {
      console.log('Processing document with options:', processingOptions);

      // Convert content to string if it's a Buffer
      const originalContent = Buffer.isBuffer(content) ? content.toString('utf-8') : content;
      const documentId = this.generateDocumentId();

      // Extract text if requested
      let processedContent = originalContent;
      if (processingOptions.extractText) {
        processedContent = await this.extractText(originalContent, processingOptions);
      }

      // Extract metadata if requested
      let metadata: DocumentMetadata = {};
      if (processingOptions.extractMetadata) {
        metadata = await this.extractMetadata(processedContent, processingOptions);
      }

      // Generate chunks if requested
      let chunks: DocumentChunk[] = [];
      if (processingOptions.chunkSize && processingOptions.chunkSize > 0) {
        chunks = await this.generateChunks(processedContent, processingOptions);
      }

      // Generate embeddings if requested
      let embeddings: number[][] = [];
      if (processingOptions.generateEmbeddings) {
        embeddings = await this.generateEmbeddings(chunks, processingOptions);
      }

      const processingTime = Date.now() - startTime;

      const result: ProcessedDocument = {
        id: documentId,
        originalContent,
        processedContent,
        chunks,
        metadata,
        embeddings,
        processingTime,
        status: 'success',
      };

      console.log('Document processed successfully:', {
        id: documentId,
        processingTime,
        chunksCount: chunks.length,
        embeddingsCount: embeddings.length,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Document processing failed:', error);

      return {
        id: this.generateDocumentId(),
        originalContent: Buffer.isBuffer(content) ? content.toString('utf-8') : content,
        processedContent: '',
        chunks: [],
        metadata: {},
        embeddings: [],
        processingTime,
        status: 'failed',
        error: error.message,
      };
    }
  }

  async extractText(content: string, options: ProcessingOptions): Promise<string> {
    try {
      console.log('Extracting text from content');

      // Simulate text extraction delay
      await new Promise(resolve => setTimeout(resolve, 150));

      let extractedText = content;

      // Basic text cleaning
      if (!options.preserveFormatting) {
        // Remove excessive whitespace
        extractedText = extractedText.replace(/\s+/g, ' ');
        
        // Remove special characters that might interfere with processing
        extractedText = extractedText.replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>/\\|]/g, '');
        
        // Normalize line breaks
        extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      }

      // Language detection (simplified)
      if (options.language) {
        // In a real implementation, this would use a language detection library
        console.log(`Language detected: ${options.language}`);
      }

      console.log('Text extraction completed');
      return extractedText.trim();
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  async extractMetadata(content: string, options: ProcessingOptions): Promise<DocumentMetadata> {
    try {
      console.log('Extracting metadata from content');

      // Simulate metadata extraction delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const metadata: DocumentMetadata = {};

      // Extract basic statistics
      metadata.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      metadata.language = options.language || 'en';

      // Extract dates (simplified pattern matching)
      const datePatterns = [
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
        /\b\d{4}-\d{1,2}-\d{1,2}\b/g,
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
      ];

      const dates: string[] = [];
      datePatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          dates.push(...matches);
        }
      });

      if (dates.length > 0) {
        metadata.creationDate = new Date(dates[0]);
        if (dates.length > 1) {
          metadata.modificationDate = new Date(dates[dates.length - 1]);
        }
      }

      // Extract amounts and percentages
      const amountPattern = /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
      const percentagePattern = /\d+(?:\.\d+)?%/g;

      const amounts = content.match(amountPattern) || [];
      const percentages = content.match(percentagePattern) || [];

      // Extract entities
      const entities: ExtractedEntity[] = [];

      // Amount entities
      amounts.forEach((amount, index) => {
        const startIndex = content.indexOf(amount);
        entities.push({
          type: 'amount',
          value: amount,
          confidence: 0.9,
          startIndex,
          endIndex: startIndex + amount.length,
        });
      });

      // Percentage entities
      percentages.forEach((percentage, index) => {
        const startIndex = content.indexOf(percentage);
        entities.push({
          type: 'percentage',
          value: percentage,
          confidence: 0.9,
          startIndex,
          endIndex: startIndex + percentage.length,
        });
      });

      // Organization entities (simplified)
      const orgPattern = /\b(?:Inc|Corp|LLC|Ltd|Company|Corporation|Organization)\b/gi;
      const orgMatches = content.match(orgPattern);
      if (orgMatches) {
        orgMatches.forEach((match, index) => {
          const startIndex = content.indexOf(match);
          // Extract the full organization name (simplified)
          const beforeMatch = content.substring(Math.max(0, startIndex - 50), startIndex);
          const afterMatch = content.substring(startIndex + match.length, startIndex + match.length + 50);
          
          entities.push({
            type: 'organization',
            value: match,
            confidence: 0.7,
            startIndex,
            endIndex: startIndex + match.length,
          });
        });
      }

      metadata.extractedEntities = entities;

      // Generate simple summary
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        const summarySentences = sentences.slice(0, 3);
        metadata.summary = summarySentences.join('. ').trim() + '.';
      }

      // Extract tags based on content analysis
      const commonTags = ['financial', 'compliance', 'legal', 'technical', 'business'];
      const contentLower = content.toLowerCase();
      const extractedTags = commonTags.filter(tag => 
        contentLower.includes(tag) || contentLower.includes(tag.replace('al', 'al'))
      );

      if (extractedTags.length > 0) {
        metadata.tags = extractedTags;
      }

      console.log('Metadata extraction completed');
      return metadata;
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      throw new Error(`Metadata extraction failed: ${error.message}`);
    }
  }

  async generateChunks(content: string, options: ProcessingOptions): Promise<DocumentChunk[]> {
    try {
      console.log('Generating document chunks');

      const chunkSize = options.chunkSize || 1000;
      const overlapSize = options.overlapSize || 200;

      if (chunkSize <= 0) {
        throw new Error('Chunk size must be positive');
      }

      const chunks: DocumentChunk[] = [];
      let startIndex = 0;

      while (startIndex < content.length) {
        const endIndex = Math.min(startIndex + chunkSize, content.length);
        
        // Try to break at sentence boundaries
        let actualEndIndex = endIndex;
        if (endIndex < content.length) {
          const nextSentence = content.indexOf('.', endIndex);
          const nextQuestion = content.indexOf('?', endIndex);
          const nextExclamation = content.indexOf('!', endIndex);
          
          const nextBreak = Math.min(
            nextSentence > 0 ? nextSentence : Infinity,
            nextQuestion > 0 ? nextQuestion : Infinity,
            nextExclamation > 0 ? nextExclamation : Infinity
          );
          
          if (nextBreak !== Infinity && nextBreak <= endIndex + 100) {
            actualEndIndex = nextBreak + 1;
          }
        }

        const chunkContent = content.substring(startIndex, actualEndIndex).trim();
        
        if (chunkContent.length > 0) {
          const chunk: DocumentChunk = {
            id: this.generateChunkId(),
            content: chunkContent,
            startIndex,
            endIndex: actualEndIndex,
            metadata: {
              chunkIndex: chunks.length,
              chunkSize: chunkContent.length,
              isFirstChunk: chunks.length === 0,
              isLastChunk: actualEndIndex >= content.length,
            },
          };

          chunks.push(chunk);
        }

        // Move to next chunk with overlap
        startIndex = Math.max(startIndex + 1, actualEndIndex - overlapSize);
      }

      console.log(`Generated ${chunks.length} chunks`);
      return chunks;
    } catch (error) {
      console.error('Chunk generation failed:', error);
      throw new Error(`Chunk generation failed: ${error.message}`);
    }
  }

  async generateEmbeddings(chunks: DocumentChunk[], options: ProcessingOptions): Promise<number[][]> {
    try {
      console.log('Generating embeddings for chunks');

      if (chunks.length === 0) {
        return [];
      }

      // Simulate embedding generation delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock embeddings (in a real implementation, this would call an embedding service)
      const embeddings: number[][] = [];
      const embeddingDimension = 384; // Common dimension for many embedding models

      for (let i = 0; i < chunks.length; i++) {
        const embedding = Array.from({ length: embeddingDimension }, () => Math.random() * 2 - 1);
        embeddings.push(embedding);
        
        // Store embedding in chunk metadata
        chunks[i].embedding = embedding;
      }

      console.log(`Generated ${embeddings.length} embeddings with dimension ${embeddingDimension}`);
      return embeddings;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async mergeChunks(chunks: DocumentChunk[], strategy: 'sequential' | 'overlapping' = 'sequential'): Promise<string> {
    try {
      console.log('Merging chunks with strategy:', strategy);

      if (chunks.length === 0) {
        return '';
      }

      if (strategy === 'sequential') {
        return chunks.map(chunk => chunk.content).join(' ');
      } else if (strategy === 'overlapping') {
        let mergedContent = '';
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          if (i === 0) {
            mergedContent = chunk.content;
          } else {
            // Find overlap with previous chunk
            const overlap = this.findOverlap(mergedContent, chunk.content);
            if (overlap > 0) {
              mergedContent += chunk.content.substring(overlap);
            } else {
              mergedContent += ' ' + chunk.content;
            }
          }
        }
        
        return mergedContent;
      }

      throw new Error(`Unknown merge strategy: ${strategy}`);
    } catch (error) {
      console.error('Chunk merging failed:', error);
      throw new Error(`Chunk merging failed: ${error.message}`);
    }
  }

  private findOverlap(text1: string, text2: string): number {
    const maxOverlap = Math.min(text1.length, text2.length, 100);
    
    for (let i = maxOverlap; i > 0; i--) {
      const suffix = text1.substring(text1.length - i);
      const prefix = text2.substring(0, i);
      
      if (suffix.toLowerCase() === prefix.toLowerCase()) {
        return i;
      }
    }
    
    return 0;
  }

  async validateDocument(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      console.log('Validating document');

      const issues: string[] = [];
      const suggestions: string[] = [];

      // Check content length
      if (content.length === 0) {
        issues.push('Document content is empty');
      } else if (content.length < 100) {
        suggestions.push('Document content is very short, consider adding more detail');
      }

      // Check for common formatting issues
      if (content.includes('\t')) {
        suggestions.push('Document contains tab characters, consider using spaces instead');
      }

      if (content.includes('\r')) {
        suggestions.push('Document contains carriage return characters, consider normalizing line endings');
      }

      // Check for excessive whitespace
      const consecutiveSpaces = content.match(/ {3,}/g);
      if (consecutiveSpaces) {
        suggestions.push('Document contains excessive consecutive spaces');
      }

      // Check for potential encoding issues
      if (content.includes('') || content.includes('')) {
        issues.push('Document contains encoding issues or invalid characters');
      }

      // Check for balanced parentheses/brackets
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        suggestions.push('Document has unbalanced parentheses');
      }

      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        suggestions.push('Document has unbalanced brackets');
      }

      const isValid = issues.length === 0;

      console.log('Document validation completed');
      return {
        isValid,
        issues,
        suggestions,
      };
    } catch (error) {
      console.error('Document validation failed:', error);
      return {
        isValid: false,
        issues: [`Validation failed: ${error.message}`],
        suggestions: [],
      };
    }
  }

  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChunkId(): string {
    return `chunk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to get processing statistics
  getProcessingStats(): {
    defaultChunkSize: number;
    defaultOverlapSize: number;
    defaultLanguage: string;
    preserveFormatting: boolean;
  } {
    return {
      defaultChunkSize: this.defaultOptions.chunkSize || 1000,
      defaultOverlapSize: this.defaultOptions.overlapSize || 200,
      defaultLanguage: this.defaultOptions.language || 'en',
      preserveFormatting: this.defaultOptions.preserveFormatting || false,
    };
  }

  // Method to update default options
  updateDefaultOptions(options: Partial<ProcessingOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    console.log('Default processing options updated:', this.defaultOptions);
  }
}
