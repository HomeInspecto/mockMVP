import { CohereClientV2 } from 'cohere-ai';

// Initialize Cohere client
const cohere = new CohereClientV2({
  token: process.env.NEXT_PUBLIC_COHERE_API_KEY || '',
});

export interface DocumentGenerationRequest {
  template: string;
  description: string;
  fileName: string;
}

export interface DocumentGenerationResponse {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Generate document content using Cohere API
 */
export async function generateDocumentContent(
  request: DocumentGenerationRequest
): Promise<DocumentGenerationResponse> {
  try {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_COHERE_API_KEY) {
      throw new Error('Cohere API key is not configured');
    }

    // Create a comprehensive prompt for document generation
    const prompt = `You are a professional document generator. Based on the following template and description, generate a well-structured document.

Template File: ${request.fileName}
Template Content: ${request.template}

Description: ${request.description}

Please generate a professional document that:
1. Follows the structure and style of the template
2. Incorporates the content described in the description
3. Is well-formatted with proper headings, sections, and formatting
4. Is comprehensive and detailed
5. Maintains professional tone and quality

Generate the document content:`;

    // Call Cohere API using the chat method
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 2000,
      temperature: 0.7
    });

    const content = response.message?.content;
    let generatedContent = '';
    
    if (Array.isArray(content)) {
      generatedContent = content
        .map(item => {
          // Handle different content types
          if ('text' in item) {
            return item.text || '';
          }
          return '';
        })
        .join('');
    } else if (typeof content === 'string') {
      generatedContent = content;
    }

    if (!generatedContent.trim()) {
      throw new Error('No content was generated');
    }

    return {
      content: generatedContent,
      success: true,
    };
  } catch (error) {
    console.error('Error generating document with Cohere:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extract text content from uploaded file
 */
export async function extractFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Handle different file types
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'txt':
      case 'md':
      case 'html':
        reader.readAsText(file);
        break;
      case 'pdf':
        // For PDF files, we'll need additional processing
        // For now, return a placeholder
        resolve(`[PDF File: ${file.name}]\n\nNote: PDF content extraction requires additional processing. Please use text-based files for best results.`);
        break;
      case 'docx':
        // For DOCX files, we'll need additional processing
        // For now, return a placeholder
        resolve(`[DOCX File: ${file.name}]\n\nNote: DOCX content extraction requires additional processing. Please use text-based files for best results.`);
        break;
      default:
        reader.readAsText(file);
        break;
    }
  });
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['.txt', '.md', '.html', '.pdf', '.docx'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a .txt, .md, .html, .pdf, or .docx file.',
    };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload a file smaller than 10MB.',
    };
  }
  
  return { valid: true };
}
