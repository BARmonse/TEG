import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { GameService } from '../../../core/services/game.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

export interface LobbyEvent {
    type: 'USER_JOINED' | 'USER_LEFT' | 'GAME_STARTED' | 'GAME_CANCELLED' | 'ERROR';
    username?: string;
    gameId: number;
    message: string;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .lobby-container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }
    .lobby-header {
      background: white;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lobby-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    .role-badge {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .creator-badge {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .player-badge {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }
    .lobby-content {
      padding: 2rem;
    }
    .players-section {
      margin-bottom: 2rem;
    }
    .players-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .players-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
    }
    .players-count {
      background-color: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .player-card {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s;
    }
    .player-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .player-avatar {
      width: 2.5rem;
      height: 2.5rem;
      background-color: #e5e7eb;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #4b5563;
    }
    .player-info {
      flex: 1;
    }
    .player-name {
      font-weight: 500;
      color: #111827;
      margin-bottom: 0.25rem;
    }
    .player-status {
      font-size: 0.75rem;
      color: #6b7280;
    }
    .creator-indicator {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background-color: #fef3c7;
      color: #92400e;
      border-radius: 9999px;
      font-weight: 500;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem 2rem;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      font-size: 0.875rem;
    }
    .btn-leave {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .btn-leave:hover {
      background-color: #fecaca;
    }
    .btn-start {
      background-color: #34d399;
      color: white;
    }
    .btn-start:hover {
      background-color: #10b981;
    }
    .btn-start:disabled {
      background-color: #d1d5db;
      cursor: not-allowed;
    }
    .message {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }
    .message-success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .message-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .message-info {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
  `],
  template: `
    <div *ngIf="!isLoading" class="lobby-container">
      <div class="lobby-header">
        <h1 class="lobby-title">{{ gameName }}</h1>
        <span class="role-badge" [class]="isCreator ? 'creator-badge' : 'player-badge'">
          {{ isCreator ? 'Creator' : 'Player' }}
        </span>
      </div>

      <div class="lobby-content">
        <div class="players-section">
          <div class="players-header">
            <h2 class="players-title">Players</h2>
            <span class="players-count">{{players.length}}/{{maxPlayers}}</span>
          </div>

          <div class="players-grid">
            <div *ngFor="let player of players" 
                 class="player-card"
                 [@playerAnimation]>
              <div class="player-avatar">
                {{ player.charAt(0).toUpperCase() }}
              </div>
              <div class="player-info">
                <div class="player-name">{{player}}</div>
                <div class="player-status" *ngIf="player === creatorUsername">Game Creator</div>
              </div>
            </div>
          </div>

          <div *ngIf="lastMessage" 
               class="message"
               [ngClass]="{
                 'message-success': lastMessage.type === 'USER_JOINED',
                 'message-error': lastMessage.type === 'USER_LEFT',
                 'message-info': lastMessage.type === 'ERROR'
               }">
            {{ lastMessage.message }}
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-leave" (click)="leaveGame()">
          Leave Game
        </button>
        <button 
          *ngIf="isCreator"
          class="btn btn-start"
          [disabled]="players.length < 2"
          (click)="startGame()">
          {{ players.length < 2 ? 'Waiting for Players...' : 'Start Game' }}
        </button>
      </div>
    </div>
    <div *ngIf="isLoading" class="loading-container">
      <div class="loader"></div>
    </div>
  `,
  animations: [
    trigger('playerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LobbyComponent implements OnInit, OnDestroy {
  private gameId!: number;
  private subscriptions: Subscription[] = [];
  players: string[] = [];
  maxPlayers: number = 6;
  isCreator: boolean = false;
  creatorUsername: string = '';
  lastMessage: LobbyEvent | null = null;
  currentUsername: string = '';
  isLeaving = false;
  isLoading = true;
  gameName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wsService: WebSocketService,
    private authService: AuthService,
    private gameService: GameService
  ) {
    this.currentUsername = this.authService.currentUserValue?.username || '';
  }

  ngOnInit() {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.gameId) {
      this.router.navigate(['/games']);
      return;
    }
    // Fetch game info and players before showing lobby
    this.isLoading = true;
    this.gameService.getGame(this.gameId).subscribe({
      next: (game) => {
        // Ensure creator is always first in the players list
        const others = (game.playerUsernames || []).filter(u => u !== game.creatorUsername);
        this.players = [game.creatorUsername, ...others];
        this.maxPlayers = game.maxPlayers;
        this.gameName = game.name;
        this.creatorUsername = game.creatorUsername;
        this.isCreator = this.currentUsername === this.creatorUsername;
        this.isLoading = false;
        // Subscribe to WebSocket events after initial load
        this.subscribeToGameEvents();
        // Join the game via WebSocket
        this.wsService.joinGame(this.gameId.toString());
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/games']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Leave the game if we're not starting it
    if (this.lastMessage?.type !== 'GAME_STARTED') {
      this.wsService.leaveGame(this.gameId.toString());
    }
  }

  private subscribeToGameEvents() {
    this.subscriptions.push(
      this.wsService.messages$.subscribe(message => {
        if (message.type === 'LOBBY_EVENT') {
          const event = message.payload as LobbyEvent;
          this.handleLobbyEvent(event);
        }
      })
    );
  }

  private handleLobbyEvent(event: LobbyEvent) {
    this.lastMessage = event;

    switch (event.type) {
      case 'USER_JOINED':
        if (event.username && !this.players.includes(event.username)) {
          this.players.push(event.username);
        }
        break;

      case 'USER_LEFT':
        if (event.username) {
          this.players = this.players.filter(player => player !== event.username);
        }
        break;

      case 'GAME_STARTED':
        this.router.navigate(['/game', this.gameId, 'play']);
        break;

      case 'GAME_CANCELLED':
        this.router.navigate(['/games']);
        break;

      case 'ERROR':
        // Error is already shown through lastMessage
        break;
    }

    // Always keep creator first
    const others = this.players.filter(u => u !== this.creatorUsername);
    this.players = [this.creatorUsername, ...others];
  }

  leaveGame() {
    if (this.isLeaving) return;
    
    this.isLeaving = true;
    
    // If we're the creator or the last player, cancel the game
    if (this.isCreator || this.players.length === 1) {
      this.gameService.cancelGame(this.gameId).subscribe({
        next: () => {
          this.wsService.leaveGame(this.gameId.toString());
          this.router.navigate(['/games']);
        },
        error: (error) => {
          console.error('Error cancelling game:', error);
          this.isLeaving = false;
        }
      });
    } else {
      // Just leave the game
      this.wsService.leaveGame(this.gameId.toString());
      this.router.navigate(['/games']);
    }
  }

  startGame() {
    if (this.isCreator && this.players.length >= 2) {
      this.wsService.startGame(this.gameId.toString());
    }
  }
} 