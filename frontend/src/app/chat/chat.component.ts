import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, LLAMA4_CAPABILITIES, PromptTemplate, QuickAction } from '../interfaces';
import { ChatService } from '../services';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('documentInput') documentInput!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // État principal
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;

  // Capacités multimodales
  selectedImage: File | null = null;
  selectedImageUrl: string | null = null;
  selectedDocument: File | null = null;

  // Interface avancée
  showCapabilities: boolean = false;
  showPromptTemplates: boolean = false;
  showQuickActions: boolean = false;
  activeMode: 'chat' | 'image' | 'code' | 'document' = 'chat';

  // Options de génération
  codeLanguage: string = 'javascript';
  codeComplexity: 'simple' | 'intermediate' | 'advanced' = 'intermediate';
  imageAnalysisType: 'analyze' | 'ocr' | 'custom' = 'analyze';

  // Templates et actions
  promptTemplates: PromptTemplate[] = [];
  quickActions: QuickAction[] = [];

  // Statistiques
  conversationStats: any = {};

  private subscription: Subscription = new Subscription();

  Math = Math;
  // Langages de programmation supportés
  programmingLanguages = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php',
    'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'sql'
  ];

  constructor(private chatService: ChatService) {
    this.initializeQuickActions();
  }

  ngOnInit() {
    this.subscription.add(
      this.chatService.messages$.subscribe(messages => {
        this.messages = messages;
        this.updateConversationStats();
      })
    );

    this.promptTemplates = this.chatService.getPromptTemplates();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // === Actions principales ===

  sendMessage() {
    if ((!this.currentMessage.trim() && !this.selectedImage && !this.selectedDocument) || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const messageText = this.currentMessage.trim();

    // Déterminer le type de message
    let options: any = {};

    if (this.selectedImage) {
      options.imageUrl = this.selectedImageUrl;
      options.type = 'multimodal';
    } else if (this.selectedDocument) {
      options.type = 'document';
      options.fileName = this.selectedDocument.name;
    } else if (this.activeMode === 'code') {
      options.type = 'code';
      options.language = this.codeLanguage;
    }

    this.chatService.sendMessage(messageText, options).subscribe({
      next: (response) => this.handleResponse(response),
      error: (error) => this.handleError(error)
    });

    this.resetInput();
  }

  // === Gestion des images ===

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;
      this.activeMode = 'image';

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  analyzeImage(type: 'analyze' | 'ocr' | 'custom' = 'analyze') {
    if (!this.selectedImage) return;

    this.isLoading = true;
    this.chatService.uploadAndAnalyzeImage(this.selectedImage, type, this.currentMessage)
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });

    this.resetInput();
  }

  // === Gestion du code ===

  generateCode() {
    if (!this.currentMessage.trim()) return;

    this.isLoading = true;
    this.chatService.generateCode(this.currentMessage, this.codeLanguage, this.codeComplexity)
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });

    this.resetInput();
  }

  switchToCodeMode(language?: string) {
    this.activeMode = 'code';
    if (language) this.codeLanguage = language;
    this.focusInput();
  }

  // === Gestion des documents ===

  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      this.selectedDocument = file;
      this.activeMode = 'document';

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.currentMessage = content.substring(0, 50000); // Limite pour l'affichage
      };
      reader.readAsText(file);
    }
  }

  processDocument(action: 'summarize' | 'analyze' | 'extract' | 'translate') {
    if (!this.selectedDocument && !this.currentMessage.trim()) return;

    this.isLoading = true;
    const content = this.currentMessage.trim();

    this.chatService.processLongDocument(content, action)
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });

    this.resetInput();
  }

  // === Templates et actions rapides ===

  useTemplate(template: PromptTemplate) {
    this.currentMessage = template.prompt;
    this.activeMode = template.category === 'image' ? 'image' :
                     template.category === 'code' ? 'code' :
                     template.category === 'document' ? 'document' : 'chat';
    this.showPromptTemplates = false;
    this.focusInput();
  }

  executeQuickAction(action: QuickAction) {
    action.action();
    this.showQuickActions = false;
  }

  initializeQuickActions() {
    this.quickActions = [
      {
        id: 'upload-image',
        name: 'Analyser une image',
        description: 'Upload et analyse automatique',
        icon: '🖼️',
        category: 'image',
        action: () => this.triggerFileInput('image')
      },
      {
        id: 'generate-js',
        name: 'Code JavaScript',
        description: 'Générer du code JS/TS',
        icon: '🟨',
        category: 'code',
        action: () => this.switchToCodeMode('javascript')
      },
      {
        id: 'generate-python',
        name: 'Code Python',
        description: 'Générer du code Python',
        icon: '🐍',
        category: 'code',
        action: () => this.switchToCodeMode('python')
      },
      {
        id: 'upload-document',
        name: 'Traiter un document',
        description: 'Upload et analyse de texte',
        icon: '📄',
        category: 'document',
        action: () => this.triggerFileInput('document')
      },
      {
        id: 'debug-code',
        name: 'Débugger du code',
        description: 'Analyser et corriger',
        icon: '🐛',
        category: 'code',
        action: () => {
          this.currentMessage = 'Voici mon code à débugger :\n\n```\n// Votre code ici\n```';
          this.activeMode = 'code';
          this.focusInput();
        }
      },
      {
        id: 'explain-image',
        name: 'Expliquer une image',
        description: 'Description pédagogique',
        icon: '🎓',
        category: 'image',
        action: () => {
          this.currentMessage = 'Explique cette image de manière pédagogique et détaillée';
          this.triggerFileInput('image');
        }
      }
    ];
  }

  // === Utilitaires ===

  triggerFileInput(type: 'image' | 'document') {
    if (type === 'image') {
      this.fileInput.nativeElement.click();
    } else {
      this.documentInput.nativeElement.click();
    }
  }

  clearSelectedFiles() {
    this.selectedImage = null;
    this.selectedImageUrl = null;
    this.selectedDocument = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    if (this.documentInput) this.documentInput.nativeElement.value = '';
  }

  resetInput() {
    this.currentMessage = '';
    this.clearSelectedFiles();
    this.activeMode = 'chat';
  }

  focusInput() {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      // Actions spéciales selon le mode
      if (this.activeMode === 'image' && this.selectedImage) {
        this.analyzeImage(this.imageAnalysisType);
      } else if (this.activeMode === 'code') {
        this.generateCode();
      } else if (this.activeMode === 'document' && this.selectedDocument) {
        this.processDocument('analyze');
      } else {
        this.sendMessage();
      }
    }
  }

  onInput(event: any) {
    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  handleResponse(response: any) {
    if (response.success) {
      this.chatService.addAssistantMessage(response.response, response.metadata);
    } else {
      this.chatService.addAssistantMessage(`❌ Erreur: ${response.error}`);
    }
    this.isLoading = false;
  }

  handleError(error: any) {
    console.error('Erreur:', error);
    this.chatService.addAssistantMessage('❌ Erreur de communication avec le serveur.');
    this.isLoading = false;
  }

  updateConversationStats() {
    this.conversationStats = this.chatService.getConversationStats();
  }

  clearConversation() {
    this.chatService.clearChat();
    this.resetInput();
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }

  // === Getters pour l'interface ===

  get capabilities() {
    return LLAMA4_CAPABILITIES;
  }

  get currentModeIcon() {
    const icons = {
      chat: '💬',
      image: '🖼️',
      code: '💻',
      document: '📚'
    };
    return icons[this.activeMode];
  }

  get currentModeName() {
    const names = {
      chat: 'Chat général',
      image: 'Analyse d\'image',
      code: 'Génération de code',
      document: 'Traitement de document'
    };
    return names[this.activeMode];
  }

  get sendButtonTitle() {
    if (this.isLoading) return 'Génération en cours...';
    if (this.activeMode === 'image' && this.selectedImage) return 'Analyser l\'image';
    if (this.activeMode === 'code') return 'Générer le code';
    if (this.activeMode === 'document') return 'Traiter le document';
    return 'Envoyer le message';
  }

  getPlaceholder() {
    if (this.activeMode === 'image' && this.selectedImage) {
      return `Que voulez-vous savoir sur cette image ? (${this.imageAnalysisType})`;
    }
    if (this.activeMode === 'code') {
      return `Décrivez le code ${this.codeLanguage} à générer...`;
    }
    if (this.activeMode === 'document' && this.selectedDocument) {
      return 'Que voulez-vous faire avec ce document ?';
    }
    return 'Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.timestamp.getTime().toString();
  }
}
