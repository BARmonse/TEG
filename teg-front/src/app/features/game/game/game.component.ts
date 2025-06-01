import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
      padding: 1.5rem;
    }
    .container {
      max-width: 96rem;
      margin: 0 auto;
    }
    .game-header {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    .game-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    .game-info {
      font-size: 0.875rem;
      color: #6b7280;
    }
  `],
  template: `
    <div class="container">
      <div class="game-header">
        <h1 class="game-title">Game #{{ gameId }}</h1>
        <div class="game-info">
          Loading game information...
        </div>
      </div>
      
      <!-- Game board and controls will be added here -->
    </div>
  `
})
export class GameComponent implements OnInit, OnDestroy {
  gameId: string;
  private wsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private wsService: WebSocketService
  ) {
    this.gameId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (this.gameId) {
      // Request game information
      this.wsService.send({
        type: 'GET_GAME_INFO',
        payload: { gameId: this.gameId }
      });

      // Subscribe to WebSocket messages
      this.wsSubscription = this.wsService.messages$.subscribe({
        next: (message) => {
          switch (message.type) {
            case 'GAME_INFO':
              // Handle game information update
              console.log('Game info received:', message.payload);
              break;
            case 'GAME_STATE_UPDATED':
              // Handle game state updates
              console.log('Game state updated:', message.payload);
              break;
            case 'ERROR':
              console.error('Game error:', message.payload.message);
              break;
          }
        },
        error: (error) => {
          console.error('WebSocket error:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
} 