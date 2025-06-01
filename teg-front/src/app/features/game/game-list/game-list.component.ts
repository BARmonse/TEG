import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

interface Game {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  gameMode: string;
  status: 'waiting' | 'in_progress' | 'finished';
  createdAt: string;
}

@Component({
  selector: 'app-game-list',
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
      max-width: 64rem;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .title {
      font-size: 1.875rem;
      font-weight: bold;
      color: #111827;
    }
    .create-button {
      padding: 0.75rem 1.5rem;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .create-button:hover {
      background-color: #4f46e5;
      transform: translateY(-1px);
    }
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .game-card {
      background-color: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      cursor: pointer;
    }
    .game-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .game-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    .game-info {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
    .game-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }
    .status-waiting {
      background-color: #dcfce7;
      color: #166534;
    }
    .status-in-progress {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .status-finished {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .empty-state-text {
      font-size: 1.125rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
  `],
  template: `
    <div class="container">
      <div class="header">
        <h1 class="title">Available Games</h1>
        <button class="create-button" (click)="navigateToCreate()">Create Game</button>
      </div>

      <div *ngIf="games.length > 0; else noGames" class="games-grid">
        <div
          *ngFor="let game of games"
          class="game-card"
          (click)="joinGame(game.id)"
        >
          <div class="game-name">{{ game.name }}</div>
          <div class="game-info">
            Players: {{ game.currentPlayers }}/{{ game.maxPlayers }}
          </div>
          <div class="game-info">
            Mode: {{ game.gameMode }}
          </div>
          <div class="game-info">
            Created: {{ game.createdAt | date:'short' }}
          </div>
          <div
            class="game-status"
            [ngClass]="{
              'status-waiting': game.status === 'waiting',
              'status-in-progress': game.status === 'in_progress',
              'status-finished': game.status === 'finished'
            }"
          >
            {{ game.status | titlecase }}
          </div>
        </div>
      </div>

      <ng-template #noGames>
        <div class="empty-state">
          <p class="empty-state-text">No games available at the moment</p>
          <button class="create-button" (click)="navigateToCreate()">
            Create a New Game
          </button>
        </div>
      </ng-template>
    </div>
  `
})
export class GameListComponent implements OnInit, OnDestroy {
  games: Game[] = [];
  private wsSubscription?: Subscription;

  constructor(
    private wsService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Request the initial game list
    this.wsService.send({
      type: 'GET_GAMES',
      payload: {}
    });

    // Subscribe to WebSocket messages
    this.wsSubscription = this.wsService.messages$.subscribe({
      next: (message) => {
        switch (message.type) {
          case 'GAMES_LIST':
            this.games = message.payload.games;
            break;
          case 'GAME_UPDATED':
            this.updateGame(message.payload);
            break;
          case 'GAME_JOINED':
            this.router.navigate(['/game', message.payload.gameId]);
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

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/game/create']);
  }

  joinGame(gameId: string): void {
    this.wsService.joinGame(gameId);
  }

  private updateGame(updatedGame: Game): void {
    const index = this.games.findIndex(game => game.id === updatedGame.id);
    if (index !== -1) {
      this.games[index] = updatedGame;
    } else {
      this.games.push(updatedGame);
    }
    this.games = [...this.games]; // Trigger change detection
  }
} 