import { Component } from '@angular/core';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  template: '<app-chat></app-chat>',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class AppComponent {
  title = 'Assistant Llama 4';
}
