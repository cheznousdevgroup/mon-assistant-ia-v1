import { Routes } from "@angular/router";
import { ChatComponent } from "./chat/chat.component";


export const routes: Routes = [
  { path: 'chat', component: ChatComponent }, // Route vers le chat
  { path: '', redirectTo: 'chat', pathMatch: 'full' }, // redirection par défaut
];
