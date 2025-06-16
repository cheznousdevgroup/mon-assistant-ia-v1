import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatService } from '../services/chat.service';

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
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  newMessage: string = '';
  messages: Message[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  sendMessage() {
    const userPrompt = this.newMessage.trim();
    if (userPrompt) {
      const message: Message = {
        prompt: userPrompt,
        fromUser: true,
        timestamp: new Date(),
      };
      this.messages.push(message);
      this.newMessage = '';

      this.chatService.sendMessage(userPrompt).subscribe(
        (res) => {
          const last = this.messages[this.messages.length - 1];
          last.response = res.response;
        },
        (err) => {
          console.error(err);
          const last = this.messages[this.messages.length - 1];
          last.response = '[Erreur lors de la réponse]';
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
