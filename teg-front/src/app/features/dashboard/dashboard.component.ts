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
  `],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-content">
          <h1 class="title">Welcome to TEG</h1>
          <p class="subtitle">What would you like to do?</p>
        </div>
        <app-active-users></app-active-users>
      </div>

      <div class="quick-actions">
        <a routerLink="/game" class="action-card">
          <h2 class="action-title">Join a Game</h2>
          <p class="action-description">
            Browse available games or create your own to start playing
          </p>
        </a>

        <a routerLink="/game/create" class="action-card">
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
  username = 'User'; // This should come from your auth service
  gamesPlayed = 0;
  gamesWon = 0;
  winRate = 0;

  constructor(private authService: AuthService) {
    // Get the username from the auth service
    this.username = this.authService.currentUserValue?.username || 'User';
    
    // TODO: Get these values from your game service
    this.gamesPlayed = 0;
    this.gamesWon = 0;
    this.winRate = this.gamesPlayed > 0 ? Math.round((this.gamesWon / this.gamesPlayed) * 100) : 0;
  }

  logout(): void {
    this.authService.logout();
  }
} 