import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, ChatResponse, PromptTemplate } from '../interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl =environment.apiUrl;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Bonjour, je suis votre assistant Miuuu 1.

Je propose des fonctionnalités avancées pour répondre à vos besoins :

• Analyse d’images : description, OCR, compréhension visuelle
• Génération et correction de code : tous langages, optimisation incluse
• Traitement de documents longs
• Raisonnement multimodal : compréhension combinée texte + image
• Support multilingue : 12 langues disponibles

Comment puis-je vous assister aujourd’hui ?`,
      timestamp: new Date(),
      type: 'text',
    },
  ]);

  public messages$ = this.messagesSubject.asObservable();

  // Templates de prompts prédéfinis
  public promptTemplates: PromptTemplate[] = [
    {
      id: 'image-analyze',
      name: 'Analyser une image',
      description: 'Description détaillée, objets, couleurs, composition',
      prompt:
        "Analyse cette image en détail. Décris les objets, les couleurs, la composition, l'ambiance et tout élément notable que tu observes.",
      category: 'image',
      icon: '🖼️',
    },
    {
      id: 'image-ocr',
      name: 'Extraire le texte (OCR)',
      description: 'Lire et extraire tout le texte visible',
      prompt:
        'Extrait et transcris tout le texte visible dans cette image. Organise-le de manière claire et lisible.',
      category: 'image',
      icon: '📝',
    },
    {
      id: 'code-review',
      name: 'Review de code',
      description: 'Analyser et améliorer le code',
      prompt:
        'Fais une review complète de ce code. Identifie les problèmes potentiels, propose des améliorations en termes de performance, lisibilité et bonnes pratiques.',
      category: 'code',
      icon: '🔍',
    },
    {
      id: 'code-generate',
      name: 'Générer du code',
      description: 'Créer du code selon vos spécifications',
      prompt: 'Génère du code propre et bien documenté pour : ',
      category: 'code',
      icon: '⚡',
    },
    {
      id: 'code-debug',
      name: 'Débugger',
      description: 'Identifier et corriger les erreurs',
      prompt:
        'Analyse ce code et identifie les erreurs. Propose des corrections avec explications détaillées.',
      category: 'code',
      icon: '🐛',
    },
    {
      id: 'document-summarize',
      name: 'Résumer un document',
      description: 'Synthèse claire et structurée',
      prompt:
        'Fais un résumé structuré de ce document en gardant les points clés et les informations importantes.',
      category: 'document',
      icon: '📄',
    },
    {
      id: 'multimodal-compare',
      name: 'Comparer image et texte',
      description: 'Analyser la cohérence texte/image',
      prompt:
        'Compare cette image avec le texte fourni. Analyse les correspondances, différences et cohérence entre les deux.',
      category: 'image',
      icon: '🔄',
    },
  ];

  constructor(private http: HttpClient) {}

  // Envoi de message standard
  sendMessage(
    content: string,
    options?: {
      imageUrl?: string;
      type?: 'text' | 'code' | 'multimodal' | 'document';
      language?: string;
      fileName?: string;
    }
  ): Observable<ChatResponse> {
    const message: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl: options?.imageUrl,
      type: options?.type || 'text',
      language: options?.language,
      fileName: options?.fileName,
    };

    this.addMessage(message);

    // Préparer la conversation avec plus de contexte
    const conversation = this.messagesSubject.value
      .slice(1) // Exclure le message de bienvenue
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.imageUrl && { imageUrl: msg.imageUrl }),
      }));

    // Choisir l'endpoint selon le type
    const endpoint = options?.imageUrl ? '/multimodal' : '/message';

    const payload = {
      message: content,
      conversation,
      ...(options?.imageUrl && { imageUrl: options.imageUrl }),
      options: {
        temperature: 0.7,
        max_tokens: options?.type === 'document' ? 4000 : 2000,
        ...(options?.type === 'code' && {
          temperature: 0.3, // Plus précis pour le code
          max_tokens: 3000,
        }),
      },
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}${endpoint}`, payload);
  }

  // Envoi de message avec template
  sendMessageWithTemplate(
    templateId: string,
    content: string,
    imageUrl?: string
  ): Observable<ChatResponse> {
    const template = this.promptTemplates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error('Template non trouvé');
    }

    const fullPrompt = template.prompt + (content ? '\n\n' + content : '');

    return this.sendMessage(fullPrompt, {
      imageUrl,
      type:
        template.category === 'image'
          ? 'multimodal'
          : (template.category as any),
    });
  }

  // Upload et analyse d'image
  uploadAndAnalyzeImage(
    file: File,
    analysisType: 'analyze' | 'ocr' | 'custom' = 'analyze',
    customPrompt?: string
  ): Observable<ChatResponse> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        let prompt = '';
        switch (analysisType) {
          case 'analyze':
            prompt =
              "Analyse cette image en détail. Décris ce que tu vois, les objets, les couleurs, la composition et l'ambiance.";
            break;
          case 'ocr':
            prompt =
              'Extrait et transcris tout le texte visible dans cette image de manière organisée.';
            break;
          case 'custom':
            prompt = customPrompt || 'Décris cette image.';
            break;
        }

        this.sendMessage(prompt, { imageUrl, type: 'multimodal' }).subscribe(
          observer
        );
      };
      reader.readAsDataURL(file);
    });
  }

  // Génération de code avancée
  generateCode(
    specification: string,
    language: string,
    complexity: 'simple' | 'intermediate' | 'advanced' = 'intermediate'
  ): Observable<ChatResponse> {
    const complexityPrompts = {
      simple: 'Génère du code simple et bien commenté',
      intermediate:
        "Génère du code robuste avec gestion d'erreurs et bonnes pratiques",
      advanced:
        'Génère du code optimisé, scalable avec patterns avancés et tests',
    };

    const prompt = `${complexityPrompts[complexity]} en ${language} pour : ${specification}

Inclus :
- Code principal bien structuré
- Commentaires explicatifs
- Gestion d'erreurs appropriée
- Exemples d'utilisation si pertinent`;

    return this.sendMessage(prompt, { type: 'code', language });
  }

  // Traitement de documents longs
  processLongDocument(
    content: string,
    action: 'summarize' | 'analyze' | 'extract' | 'translate',
    options?: any
  ): Observable<ChatResponse> {
    const actionPrompts = {
      summarize:
        'Fais un résumé structuré et détaillé de ce document en gardant toutes les informations importantes',
      analyze:
        'Analyse ce document : structure, thèmes principaux, arguments clés, conclusions',
      extract:
        'Extrait les informations clés, dates importantes, noms, chiffres et concepts principaux',
      translate: `Traduis ce document en ${
        options?.targetLanguage || 'français'
      } en gardant le sens et la structure`,
    };

    const prompt = `${actionPrompts[action]} :

${content}`;

    return this.sendMessage(prompt, { type: 'document' });
  }

  addMessage(message: ChatMessage) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  addAssistantMessage(content: string, metadata?: any) {
    this.addMessage({
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata,
    });
  }

  clearChat() {
    this.messagesSubject.next([
      {
        role: 'assistant',
        content: `🚀 Nouvelle conversation !

Je suis prêt pour :
• 🖼️ Analyser vos images
• 💻 Générer/débugger du code
• 📚 Traiter vos documents
• 🧠 Combiner texte et visuels

Que souhaitez-vous faire ?`,
        timestamp: new Date(),
        type: 'text',
      },
    ]);
  }

  getPromptTemplates(category?: string): PromptTemplate[] {
    return category
      ? this.promptTemplates.filter((t) => t.category === category)
      : this.promptTemplates;
  }

  // Statistiques de conversation
  getConversationStats() {
    const messages = this.messagesSubject.value;
    return {
      totalMessages: messages.length,
      userMessages: messages.filter((m) => m.role === 'user').length,
      assistantMessages: messages.filter((m) => m.role === 'assistant').length,
      imagesProcessed: messages.filter((m) => m.imageUrl).length,
      codeGenerated: messages.filter((m) => m.type === 'code').length,
      documentsProcessed: messages.filter((m) => m.type === 'document').length,
      estimatedTokens: messages.reduce(
        (acc, m) => acc + m.content.length / 4,
        0
      ), // Estimation approximative
    };
  }
}
