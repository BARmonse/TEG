import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-active-users',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: white;
      border-radius: 9999px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .dot {
      width: 0.5rem;
      height: 0.5rem;
      background-color: #10b981;
      border-radius: 9999px;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .text {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `],
  template: `
    <div class="dot"></div>
    <span class="text">{{ (wsService.activeUsersCount$ | async) || 0 }} active users</span>
  `
})
export class ActiveUsersComponent {
  constructor(public wsService: WebSocketService) {}
} 