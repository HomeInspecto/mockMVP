import { CohereClientV2 } from 'cohere-ai';

/**
 * Initialize and configure Cohere API connection
 */
export class CohereAPIConnector {
  private client: CohereClientV2 | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
    
    if (!apiKey || apiKey === 'your_cohere_api_key_here') {
      console.warn('Cohere API key is not configured. Please set NEXT_PUBLIC_COHERE_API_KEY in your environment variables.');
      this.isConfigured = false;
      return;
    }

    this.client = new CohereClientV2({
      token: apiKey,
    });
    this.isConfigured = true;
  }

  /**
   * Check if the API is properly configured
   */
  isAPIConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get the Cohere client instance
   */
  getClient(): CohereClientV2 | null {
    return this.isConfigured ? this.client : null;
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'API key is not configured'
      };
    }

    try {
      // Make a simple API call to test the connection
      const response = await this.client!.chat({
        model: 'command-a-03-2025',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test.'
          }
        ],
        maxTokens: 10,
      });

      const content = response.message?.content;
      let hasContent = false;
      
      if (Array.isArray(content)) {
        hasContent = content.length > 0 && content.some(item => {
          if ('text' in item) {
            return item.text?.trim();
          }
          return false;
        });
      } else if (typeof content === 'string') {
        hasContent = (content as string).trim().length > 0;
      }

      if (hasContent) {
        return {
          success: true,
          message: 'API connection successful'
        };
      } else {
        return {
          success: false,
          message: 'API returned empty response'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export a singleton instance
export const cohereAPI = new CohereAPIConnector();
