import { Ollama } from 'ollama'

export class LLMService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama();
  }

  async query(message: string, context: string) {
    const response = await this.ollama.chat({
      model: 'mistral',
      messages: [{
        role: 'system',
        content: `You are a helpful assistant for Subway restaurants. Use this context: ${context}`
      }, {
        role: 'user',
        content: message
      }]
    });

    return response.message.content;
  }
}