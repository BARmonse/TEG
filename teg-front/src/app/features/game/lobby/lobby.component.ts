import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { GameDTO, GamePlayerDTO } from '../../../core/dto/game.dto';
import { GameService } from '../../../core/services/game.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

export interface LobbyEvent {
    type: 'USER_JOINED' | 'USER_LEFT' | 'GAME_STARTED' | 'GAME_CANCELLED' | 'ERROR';
    username?: string;
    gameId: number;
    message: string;
}

// Add PlayerColor list for selection
const PLAYER_COLORS = [
  { name: 'Red', value: 'RED', hex: '#ef4444' },
  { name: 'Blue', value: 'BLUE', hex: '#3b82f6' },
  { name: 'Green', value: 'GREEN', hex: '#22c55e' },
  { name: 'Yellow', value: 'YELLOW', hex: '#eab308' },
  { name: 'Black', value: 'BLACK', hex: '#111827' },
  { name: 'White', value: 'WHITE', hex: '#f3f4f6', text: '#111827' }
];

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
                 [ngStyle]="getPlayerBorderStyle(player.color)">
              <div class="player-avatar">
                {{ player.user.username.charAt(0).toUpperCase() }}
              </div>
              <div class="player-info">
                <div class="player-name">{{ player.user.username }}</div>
                <div class="player-status" *ngIf="player.user.id === creatorId">Game Creator</div>
                <!-- Color selector for current user -->
                <div *ngIf="player.user.username === currentUsername" class="mt-2">
                  <label class="block text-xs text-gray-500 mb-1">Select your color:</label>
                  <div class="flex gap-2 flex-wrap">
                    <button *ngFor="let color of playerColors"
                      class="w-8 h-8 rounded-full border-2 flex items-center justify-center focus:outline-none"
                      [ngStyle]="{
                        'background-color': color.hex,
                        'color': color.text || '#fff',
                        'border-color': player.color === color.value ? '#6366f1' : '#e5e7eb',
                        'box-shadow': player.color === color.value ? '0 0 0 2px #6366f1' : 'none'
                      }"
                      [disabled]="player.color === color.value || isColorTaken(color.value)"
                      (click)="changeColor(color.value)">
                      <span *ngIf="player.color === color.value">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="lastMessage" 
               class="message"
               [ngClass]="{
                 'message-success': lastMessage.type === 'USER_JOINED',
                 'message-error': lastMessage.type === 'USER_LEFT' || lastMessage.type === 'GAME_CANCELLED',
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
  players: GamePlayerDTO[] = [];
  maxPlayers: number = 6;
  isCreator: boolean = false;
  creatorUsername: string = '';
  lastMessage: LobbyEvent | null = null;
  currentUsername: string = '';
  isLeaving = false;
  isLoading = true;
  gameName: string = '';
  creatorId: number | null = null;
  playerColors = PLAYER_COLORS;

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

    // Always fetch the latest game data from the backend when entering the lobby
    this.isLoading = true;
    this.gameService.getGame(this.gameId).subscribe({
      next: (game) => {
        this.setGameState(game);
        this.isLoading = false;
        this.subscribeToGameEvents();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/games']);
      }
    });
  }

  private setGameState(game: GameDTO) {
    console.log('Game state:', game);

    // Put the creator first, then the rest
    const creatorPlayer = (game.players || []).find(p => p.user.id === game.createdBy.id);
    const others = (game.players || []).filter(p => p.user.id !== game.createdBy.id);

    this.players = creatorPlayer ? [creatorPlayer, ...others] : others;

    this.maxPlayers = game.maxPlayers;
    this.gameName = game.name;
    this.creatorId = game.createdBy.id;
    this.isCreator = this.currentUsername === game.createdBy.username;
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToGameEvents() {
    this.subscriptions.push(
      this.wsService.messages$.subscribe(message => {
        // Debug: log all messages
        console.log('WebSocket message:', message);
  
        if (message.type === 'USER_JOINED') {
          const { gameId, user } = message.payload;
          if (this.gameId === gameId) {
            // Only add if not already present
            if (!this.players.some(u => u.user.id === user.id)) {
              this.players.push({ user, color: user.color, turnOrder: user.turnOrder, joinedAt: user.joinedAt, id: user.id });
            }
          }
        }
  
        if (message.type === 'USER_LEFT') {
          const { gameId, userId } = message.payload;
          if (this.gameId === gameId) {
            this.players = this.players.filter(u => u.user.id !== userId);
          }
        }

        if (message.type === 'GAME_CANCELLED') {
          const { gameId, message: cancelMessage } = message.payload;
          if (this.gameId === gameId) {
            this.lastMessage = {
              type: 'GAME_CANCELLED',
              gameId,
              message: cancelMessage
            };
            setTimeout(() => {
              this.router.navigate(['/games']);
            }, 2500);
          }
        }

        if (message.type === 'PLAYER_COLOR_CHANGED') {
          const { gameId, userId, color } = message.payload;
          if (this.gameId === gameId) {
            this.players = this.players.map(player =>
              player.user.id === userId ? { ...player, color } : player
            );
          }
        }

      })
    );
  }

  leaveGame() {
    if (this.isLeaving) return;
    if (!this.authService.currentUserValue) return;

    this.isLeaving = true;
    this.gameService.leaveGame(this.gameId, this.authService.currentUserValue.id).subscribe({
      next: () => {
        this.router.navigate(['/games']);
      },
      error: () => {
        this.isLeaving = false;
      }
    });
  }

  startGame() {
    if (this.isCreator && this.players.length >= 2) {
      this.wsService.startGame(this.gameId.toString());
    }
  }

  getPlayerBorderStyle(color: string): { [key: string]: string } {
    return {
      'border': '3px solid ' + this.getColorHex(color)
    };
  }

  getColorHex(color: string): string {
    switch (color?.toLowerCase()) {
      case 'red': return '#ef4444';      // Tailwind red-500
      case 'blue': return '#3b82f6';     // Tailwind blue-500
      case 'green': return '#22c55e';    // Tailwind green-500
      case 'yellow': return '#eab308';   // Tailwind yellow-500
      case 'purple': return '#a21caf';   // Tailwind purple-700
      case 'black': return '#111827';    // Tailwind gray-900
      default: return '#e5e7eb';         // Tailwind gray-200 (fallback)
    }
  }

  isColorTaken(color: string): boolean {
    return this.players.some(p => p.color === color && p.user.username !== this.currentUsername);
  }

  changeColor(color: string) {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;
    this.gameService.updatePlayerColor(this.gameId, userId, color).subscribe({
      error: (err) => {
        this.lastMessage = {
          type: 'ERROR',
          gameId: this.gameId,
          message: err?.error?.message || 'Color already taken by another player.'
        };
      }
    });
  }
} 