import { pipeline } from '@xenova/transformers';

export class RAGService {
  private static instance: RAGService;
  private embedder: any;
  private vectorStore: number[][] = [];
  private documents: string[] = [];

  private constructor() {}

  public static async getInstance(): Promise<RAGService> {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
      await RAGService.instance.initialize();
    }
    return RAGService.instance;
  }

  private async initialize() {
    console.log('Initializing RAG model...');
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  public async indexDocuments(outlets: any[]) {
    // Create documents from outlet data
    this.documents = outlets.map(outlet => 
      `Name: ${outlet.name}. Address: ${outlet.address}. Hours: ${outlet.operating_hours}`
    );

    // Generate embeddings for all documents
    for (const doc of this.documents) {
      const embedding = await this.getEmbedding(doc);
      this.vectorStore.push(embedding);
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const result = await this.embedder(text, { pooling: 'mean' });
    return Array.from(result.data);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  public async findRelevantDocs(query: string, k: number = 3): Promise<string[]> {
    const queryEmbedding = await this.getEmbedding(query);
    
    // Calculate similarities and get top k documents
    const similarities = this.vectorStore.map((docEmbedding, index) => ({
      index,
      similarity: this.cosineSimilarity(queryEmbedding, docEmbedding)
    }));

    const topK = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => this.documents[item.index]);

    return topK;
  }

  public async processQuery(query: string, outlets: any[]): Promise<string> {
    // Ensure documents are indexed
    if (this.vectorStore.length === 0) {
      await this.indexDocuments(outlets);
    }

    const relevantDocs = await this.findRelevantDocs(query);
    
    // Query classification logic
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('close') || queryLower.includes('latest')) {
      return this.processClosingTimeQuery(relevantDocs, outlets);
    }
    
    if (queryLower.includes('bangsar')) {
      return this.processLocationQuery('Bangsar', relevantDocs, outlets);
    }

    // Default response using relevant documents
    return `Based on the available information:\n\n${relevantDocs.join('\n\n')}`;
  }

  private processClosingTimeQuery(relevantDocs: string[], outlets: any[]): string {
    // Use relevantDocs to enhance response
    const latestOutlets = outlets
      .filter(outlet => {
        const hours = outlet.operating_hours.toLowerCase();
        return hours.includes('10:00 pm') || hours.includes('10:30 pm');
      })
      .map(outlet => `${outlet.name}: ${outlet.operating_hours}`);

    const context = relevantDocs
      .filter(doc => doc.toLowerCase().includes('pm'))
      .join('\n');

    return `Based on the available information:\n\n${context}\n\nLatest closing outlets:\n${latestOutlets.join('\n')}`;
  }

  private processLocationQuery(location: string, relevantDocs: string[], outlets: any[]): string {
    // Use relevantDocs to enhance response
    const locationOutlets = outlets
      .filter(outlet => 
        outlet.address.toLowerCase().includes(location.toLowerCase())
      )
      .map(outlet => `${outlet.name}: ${outlet.address}`);

    const relevantContext = relevantDocs
      .filter(doc => doc.toLowerCase().includes(location.toLowerCase()))
      .join('\n');

    return `Found relevant information:\n\n${relevantContext}\n\nOutlets in ${location}:\n${locationOutlets.join('\n')}`;
  }
}