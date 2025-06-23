// backend/services/ai.js
require('dotenv').config();

class LlamaAIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    // CORRECTION: Nom de modèle correct
    this.model = process.env.LLAMA_MODEL || 'meta-llama/llama-4-scout';
    this.baseURL = 'https://openrouter.ai/api/v1';
    
    console.log('🚀 Llama 4 Service initialisé');
    console.log('   Modèle:', this.model);
    console.log('   API Key:', this.apiKey ? 'Chargée ✅' : 'Manquante ❌');
  }

  async generateResponse(messages, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Mon Assistant IA'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Erreur Llama 4:', error);
      throw error;
    }
  }

  // Pour multimodal (texte + images)
  async generateMultimodalResponse(text, imageUrl = null, options = {}) {
    const messages = [{
      role: "user",
      content: imageUrl ? [
        { type: "text", text: text },
        { type: "image_url", image_url: { url: imageUrl } }
      ] : text
    }];

    return this.generateResponse(messages, options);
  }
}

module.exports = new LlamaAIService();