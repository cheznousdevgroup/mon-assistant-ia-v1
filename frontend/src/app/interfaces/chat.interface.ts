
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  type?: 'text' | 'code' | 'multimodal' | 'document';
  language?: string; // Pour le code
  fileName?: string; // Pour les documents
  metadata?: {
    imageAnalysis?: boolean;
    codeGeneration?: boolean;
    documentProcessing?: boolean;
    tokens?: number;
  };
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    imageDetected?: boolean;
    codeDetected?: boolean;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'image' | 'code' | 'document' | 'general';
  icon: string;
}

export interface AdvancedCapabilities {
  imageAnalysis: boolean;
  codeGeneration: boolean;
  documentProcessing: boolean;
  multimodalReasoning: boolean;
  longContext: boolean;
  multiLanguage: boolean;
}

export const LLAMA4_CAPABILITIES: AdvancedCapabilities = {
  imageAnalysis: true,
  codeGeneration: true,
  documentProcessing: true,
  multimodalReasoning: true,
  longContext: true, // 10M tokens
  multiLanguage: true // 12 langues
};
