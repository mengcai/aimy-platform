import { MinIOService } from './minio-service';
import { VectorStoreService } from './vector-store-service';
import { DocumentProcessor } from './document-processor';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  url: string;
  type: 'asset_doc' | 'ai_report' | 'portfolio' | 'market_data';
  relevance: number;
  metadata: {
    assetId?: string;
    portfolioId?: string;
    documentType?: string;
    lastUpdated?: string;
    confidence?: number;
  };
}

interface SearchQuery {
  query: string;
  filters?: {
    assetId?: string;
    portfolioId?: string;
    documentType?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  limit?: number;
  threshold?: number;
}

export class RAGService {
  private minioService: MinIOService;
  private vectorStore: VectorStoreService;
  private documentProcessor: DocumentProcessor;

  constructor() {
    this.minioService = new MinIOService();
    this.vectorStore = new VectorStoreService();
    this.documentProcessor = new DocumentProcessor();
  }

  async search(query: string, context: any): Promise<SearchResult[]> {
    try {
      // 1. Preprocess the query
      const processedQuery = await this.preprocessQuery(query, context);
      
      // 2. Perform vector similarity search
      const vectorResults = await this.vectorStore.similaritySearch(
        processedQuery.embedding,
        {
          limit: 10,
          threshold: 0.7,
          filters: processedQuery.filters,
        }
      );
      
      // 3. Perform keyword-based search as fallback
      const keywordResults = await this.keywordSearch(query, context);
      
      // 4. Merge and rank results
      const mergedResults = this.mergeAndRankResults(vectorResults, keywordResults, query);
      
      // 5. Enrich results with additional metadata
      const enrichedResults = await this.enrichResults(mergedResults);
      
      // 6. Apply relevance filtering
      const filteredResults = enrichedResults.filter(result => result.relevance >= 0.5);
      
      return filteredResults.slice(0, 8); // Return top 8 results
      
    } catch (error) {
      console.error('RAG search error:', error);
      
      // Fallback to basic keyword search
      return this.fallbackSearch(query, context);
    }
  }

  private async preprocessQuery(query: string, context: any) {
    // Extract entities and context from the query
    const entities = await this.extractEntities(query);
    
    // Generate query embedding
    const embedding = await this.vectorStore.generateEmbedding(query);
    
    // Build search filters based on context and entities
    const filters = this.buildSearchFilters(entities, context);
    
    return {
      query,
      embedding,
      filters,
      entities,
    };
  }

  private async extractEntities(query: string) {
    const entities: any = {};
    
    // Extract asset IDs (simple pattern matching)
    const assetIdMatch = query.match(/asset\s+(?:id\s+)?([a-zA-Z0-9-]+)/i);
    if (assetIdMatch) {
      entities.assetId = assetIdMatch[1];
    }
    
    // Extract portfolio IDs
    const portfolioMatch = query.match(/portfolio\s+(?:id\s+)?([a-zA-Z0-9-]+)/i);
    if (portfolioMatch) {
      entities.portfolioId = portfolioMatch[1];
    }
    
    // Extract document types
    const docTypes = ['prospectus', 'term sheet', 'financial statement', 'ai report', 'transparency report'];
    for (const docType of docTypes) {
      if (query.toLowerCase().includes(docType)) {
        entities.documentType = docType;
        break;
      }
    }
    
    // Extract time references
    const timeMatch = query.match(/(?:last|past|previous)\s+(\d+)\s+(day|week|month|year)s?/i);
    if (timeMatch) {
      entities.timeframe = {
        amount: parseInt(timeMatch[1]),
        unit: timeMatch[2],
      };
    }
    
    return entities;
  }

  private buildSearchFilters(entities: any, context: any) {
    const filters: any = {};
    
    // Asset filter
    if (entities.assetId || context.assetId) {
      filters.assetId = entities.assetId || context.assetId;
    }
    
    // Portfolio filter
    if (entities.portfolioId || context.portfolioId) {
      filters.portfolioId = entities.portfolioId || context.portfolioId;
    }
    
    // Document type filter
    if (entities.documentType) {
      filters.documentType = entities.documentType;
    }
    
    // Time filter
    if (entities.timeframe) {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (entities.timeframe.unit.toLowerCase()) {
        case 'day':
          startDate.setDate(endDate.getDate() - entities.timeframe.amount);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - (entities.timeframe.amount * 7));
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - entities.timeframe.amount);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - entities.timeframe.amount);
          break;
      }
      
      filters.dateRange = { start: startDate, end: endDate };
    }
    
    return filters;
  }

  private async keywordSearch(query: string, context: any): Promise<SearchResult[]> {
    try {
      // Search MinIO for relevant documents
      const documents = await this.minioService.searchDocuments(query, context);
      
      // Process and rank documents
      const results = documents.map(doc => ({
        id: doc.id,
        title: doc.name,
        content: doc.content || '',
        url: doc.url,
        type: this.inferDocumentType(doc.name, doc.metadata),
        relevance: this.calculateKeywordRelevance(query, doc.content || ''),
        metadata: {
          assetId: doc.metadata?.assetId,
          portfolioId: doc.metadata?.portfolioId,
          documentType: doc.metadata?.documentType,
          lastUpdated: doc.metadata?.lastModified,
          confidence: 0.6,
        },
      }));
      
      return results.sort((a, b) => b.relevance - a.relevance);
      
    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }

  private mergeAndRankResults(vectorResults: any[], keywordResults: any[], query: string): SearchResult[] {
    const allResults = new Map<string, SearchResult>();
    
    // Add vector search results
    vectorResults.forEach(result => {
      allResults.set(result.id, {
        ...result,
        relevance: result.relevance * 0.7, // Vector search gets 70% weight
      });
    });
    
    // Merge with keyword search results
    keywordResults.forEach(result => {
      if (allResults.has(result.id)) {
        // Combine relevance scores
        const existing = allResults.get(result.id)!;
        existing.relevance = Math.max(existing.relevance, result.relevance * 0.3);
      } else {
        allResults.set(result.id, {
          ...result,
          relevance: result.relevance * 0.3, // Keyword search gets 30% weight
        });
      }
    });
    
    // Convert to array and sort by relevance
    return Array.from(allResults.values()).sort((a, b) => b.relevance - a.relevance);
  }

  private async enrichResults(results: SearchResult[]): Promise<SearchResult[]> {
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        try {
          // Get additional metadata from MinIO
          const metadata = await this.minioService.getDocumentMetadata(result.id);
          
          // Enhance relevance based on metadata
          let enhancedRelevance = result.relevance;
          
          if (metadata?.lastModified) {
            const daysSinceUpdate = (Date.now() - new Date(metadata.lastModified).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 30) {
              enhancedRelevance += 0.1; // Boost recent documents
            }
          }
          
          if (metadata?.documentType === 'ai_report') {
            enhancedRelevance += 0.05; // Slight boost for AI reports
          }
          
          return {
            ...result,
            relevance: Math.min(enhancedRelevance, 1.0), // Cap at 1.0
            metadata: {
              ...result.metadata,
              ...metadata,
            },
          };
          
        } catch (error) {
          console.warn(`Error enriching result ${result.id}:`, error);
          return result;
        }
      })
    );
    
    return enrichedResults;
  }

  private calculateKeywordRelevance(query: string, content: string): number {
    if (!content) return 0;
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let matches = 0;
    let totalWords = queryWords.length;
    
    for (const queryWord of queryWords) {
      const wordMatches = contentWords.filter(word => word.includes(queryWord)).length;
      if (wordMatches > 0) {
        matches += Math.min(wordMatches / 10, 1); // Cap individual word contribution
      }
    }
    
    return matches / totalWords;
  }

  private inferDocumentType(filename: string, metadata: any): string {
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('prospectus') || lowerFilename.includes('terms')) {
      return 'asset_doc';
    }
    
    if (lowerFilename.includes('ai') || lowerFilename.includes('transparency') || lowerFilename.includes('report')) {
      return 'ai_report';
    }
    
    if (lowerFilename.includes('portfolio') || lowerFilename.includes('holdings')) {
      return 'portfolio';
    }
    
    if (lowerFilename.includes('market') || lowerFilename.includes('price') || lowerFilename.includes('trading')) {
      return 'market_data';
    }
    
    // Check metadata
    if (metadata?.documentType) {
      return metadata.documentType;
    }
    
    return 'asset_doc'; // Default
  }

  private async fallbackSearch(query: string, context: any): Promise<SearchResult[]> {
    // Simple fallback search using basic text matching
    try {
      const documents = await this.minioService.listDocuments(context);
      
      const results = documents
        .filter(doc => doc.name.toLowerCase().includes(query.toLowerCase()))
        .map(doc => ({
          id: doc.id,
          title: doc.name,
          content: doc.content || '',
          url: doc.url,
          type: this.inferDocumentType(doc.name, doc.metadata),
          relevance: 0.5, // Default relevance for fallback
          metadata: {
            assetId: doc.metadata?.assetId,
            portfolioId: doc.metadata?.portfolioId,
            documentType: doc.metadata?.documentType,
            lastUpdated: doc.metadata?.lastModified,
            confidence: 0.4,
          },
        }))
        .slice(0, 5);
      
      return results;
      
    } catch (error) {
      console.error('Fallback search error:', error);
      return [];
    }
  }

  // Method to add new documents to the vector store
  async addDocument(document: {
    id: string;
    title: string;
    content: string;
    metadata: any;
  }): Promise<void> {
    try {
      // Generate embedding for the document
      const embedding = await this.vectorStore.generateEmbedding(document.content);
      
      // Store in vector database
      await this.vectorStore.storeDocument({
        id: document.id,
        embedding,
        metadata: document.metadata,
      });
      
      console.log(`Document ${document.id} added to vector store`);
      
    } catch (error) {
      console.error(`Error adding document ${document.id} to vector store:`, error);
      throw error;
    }
  }

  // Method to update document embeddings
  async updateDocument(documentId: string, content: string, metadata: any): Promise<void> {
    try {
      // Generate new embedding
      const embedding = await this.vectorStore.generateEmbedding(content);
      
      // Update in vector database
      await this.vectorStore.updateDocument(documentId, {
        embedding,
        metadata,
      });
      
      console.log(`Document ${documentId} updated in vector store`);
      
    } catch (error) {
      console.error(`Error updating document ${documentId} in vector store:`, error);
      throw error;
    }
  }

  // Method to remove document from vector store
  async removeDocument(documentId: string): Promise<void> {
    try {
      await this.vectorStore.removeDocument(documentId);
      console.log(`Document ${documentId} removed from vector store`);
      
    } catch (error) {
      console.error(`Error removing document ${documentId} from vector store:`, error);
      throw error;
    }
  }
}
