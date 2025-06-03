import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService, GameDTO } from '../../../core/services/game.service';

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
    .header-actions {
      display: flex;
      gap: 1rem;
    }
    .title {
      font-size: 1.875rem;
      font-weight: bold;
      color: #111827;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
    .btn-primary {
      background-color: #6366f1;
      color: white;
    }
    .btn-primary:hover {
      background-color: #4f46e5;
    }
    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
    }
    .btn-secondary:hover {
      background-color: #d1d5db;
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
      background-color: #dcfce7;
      color: #166534;
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
    .loading {
      opacity: 0.7;
      pointer-events: none;
    }
  `],
  template: `
    <div class="container">
      <div class="header">
        <h1 class="title">Available Games</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshGames()" [class.loading]="isLoading">
            <span *ngIf="!isLoading">🔄 Refresh</span>
            <span *ngIf="isLoading">Refreshing...</span>
          </button>
          <button class="btn btn-primary" (click)="navigateToCreate()">Create Game</button>
        </div>
      </div>

      <div *ngIf="games.length > 0; else noGames" class="games-grid">
        <div
          *ngFor="let game of games"
          class="game-card"
          (click)="joinGame(game.id)"
          [class.loading]="joiningGame === game.id"
        >
          <div class="game-name">{{ game.name }}</div>
          <div class="game-info">
            Players: {{ game.currentPlayers }}/{{ game.maxPlayers }}
          </div>
          <div class="game-info">
            Created: {{ game.createdAt | date:'short' }}
          </div>
          <div class="game-status">
            Waiting for players
          </div>
        </div>
      </div>

      <ng-template #noGames>
        <div class="empty-state">
          <p class="empty-state-text">No games available at the moment</p>
          <button class="btn btn-primary" (click)="navigateToCreate()">
            Create a New Game
          </button>
        </div>
      </ng-template>
    </div>
  `
})
export class GameListComponent implements OnInit {
  games: GameDTO[] = [];
  isLoading = false;
  joiningGame: number | null = null;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshGames();
  }

  refreshGames(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.gameService.getAvailableGames().subscribe({
      next: (games) => {
        this.games = games;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching games:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/game/create']);
  }

  joinGame(gameId: number): void {
    if (this.joiningGame) return;
    
    this.joiningGame = gameId;
    this.gameService.joinGame(gameId).subscribe({
      next: (game) => {
        console.log('Successfully joined game:', game);
        this.router.navigate(['/game', gameId, 'lobby']);
      },
      error: (error) => {
        console.error('Error joining game:', error);
        this.joiningGame = null;
      },
      complete: () => {
        this.joiningGame = null;
      }
    });
  }
} 