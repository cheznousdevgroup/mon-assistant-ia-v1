import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatService } from '../services/chat.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


export interface Message {
  prompt: string;
  response?: string;
  fromUser: boolean;
  timestamp?: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  newMessage: string = '';
  messages: Message[] = [];
  loading = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const promptText = this.newMessage;
      const message: Message = {
        prompt: promptText,
        response: '...',
        fromUser: true,
        timestamp: new Date(),
      };
      this.messages.push(message);
      this.newMessage = '';
      this.loading = true;

      this.chatService.sendMessage(promptText).subscribe(
        (res) => {
          const last = this.messages[this.messages.length - 1];
          last.response = res.response;
          this.loading = false;
        },
        (err) => {
          const last = this.messages[this.messages.length - 1];
          last.response = '[Erreur de réponse]';
          console.error(err);
          this.loading = false;
        }
      );
    }
  }

  loadHistory() {
    this.chatService.getHistory().subscribe((data: Message[]) => {
      this.messages = data.reverse();
    });
  }
}
