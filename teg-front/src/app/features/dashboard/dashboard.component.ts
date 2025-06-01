import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
      padding: 1.5rem;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .dashboard-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
    }
    .welcome-text {
      color: #4b5563;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logout-button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: #4b5563;
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.2s;
    }
    .logout-button:hover {
      color: #1f2937;
    }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .stat-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #111827;
    }
    .actions-container {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .actions-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 1rem;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background-color: #f3f4f6;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      color: #4b5563;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    .action-button:hover {
      background-color: #6366f1;
      border-color: #6366f1;
      color: white;
      transform: translateY(-2px);
    }
    .action-button svg {
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 0.5rem;
    }
  `],
  template: `
    <div class="dashboard-header">
      <h1 class="dashboard-title">TEG Dashboard</h1>
      <div class="welcome-text">
        Welcome, {{ username }}
        <button class="logout-button" (click)="logout()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>

    <div class="stats-container">
      <div class="stat-card">
        <h3 class="stat-title">Games Played</h3>
        <p class="stat-value">{{ gamesPlayed }}</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-title">Games Won</h3>
        <p class="stat-value">{{ gamesWon }}</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-title">Win Rate</h3>
        <p class="stat-value">{{ winRate }}%</p>
      </div>
    </div>

    <div class="actions-container">
      <h2 class="actions-title">Quick Actions</h2>
      <div class="actions-grid">
        <a routerLink="/game/create" class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Game
        </a>
        <a routerLink="/game/join" class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Join Game
        </a>
        <a routerLink="/game/history" class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Game History
        </a>
        <a routerLink="/profile" class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Settings
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