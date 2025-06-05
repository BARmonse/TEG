import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ActiveUsersComponent } from '../../shared/components/active-users/active-users.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ActiveUsersComponent],
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
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-content {
      flex: 1;
    }
    .title {
      font-size: 1.875rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      font-size: 1rem;
      color: #6b7280;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .stat-card {
      text-align: center;
      padding: 1rem;
      border-radius: 0.375rem;
      background-color: #f9fafb;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
    }
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .action-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      text-decoration: none;
      transition: all 0.2s;
    }
    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .action-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    .action-description {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .logout-button {
      padding: 0.5rem 1rem;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .logout-button:hover {
      background-color: #dc2626;
    }
  `],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-content">
          <h1 class="title">Welcome back, {{ username }}!</h1>
          <p class="subtitle">Here are your game statistics</p>
        </div>
        <div class="header-actions">
          <app-active-users></app-active-users>
          <button (click)="logout()" class="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Games Played</div>
          <div class="stat-value">{{ gamesPlayed }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Games Won</div>
          <div class="stat-value">{{ gamesWon }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Win Rate</div>
          <div class="stat-value">{{ winRate }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Games Lost</div>
          <div class="stat-value">{{ gamesLost }}</div>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/games" class="action-card">
          <h2 class="action-title">Join a Game</h2>
          <p class="action-description">
            Browse available games or create your own to start playing
          </p>
        </a>

        <a routerLink="/games/create" class="action-card">
          <h2 class="action-title">Create New Game</h2>
          <p class="action-description">
            Set up a new game and invite other players to join
          </p>
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {
  username = '';
  gamesPlayed = 0;
  gamesWon = 0;
  gamesLost = 0;
  winRate = 0;

  constructor(private authService: AuthService) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.username = user.username;
      this.gamesPlayed = user.gamesPlayed;
      this.gamesWon = user.gamesWon;
      this.gamesLost = user.gamesLost;
      this.winRate = this.gamesPlayed > 0 ? Math.round((this.gamesWon / this.gamesPlayed) * 100) : 0;
    }
  }

  logout(): void {
    this.authService.logout();
  }
} 