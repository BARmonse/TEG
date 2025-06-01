import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
      padding: 1.5rem;
    }
    .container {
      max-width: 32rem;
      margin: 0 auto;
    }
    .form-container {
      background-color: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .form-title {
      font-size: 1.875rem;
      font-weight: bold;
      text-align: center;
      color: #111827;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #111827;
    }
    .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .form-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #111827;
      background-color: white;
    }
    .form-select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .submit-button {
      width: 100%;
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
    .submit-button:hover {
      background-color: #4f46e5;
      transform: translateY(-1px);
    }
    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .form-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
  `],
  template: `
    <div class="container">
      <div class="form-container">
        <h1 class="form-title">Create New Game</h1>
        
        <form [formGroup]="gameForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="gameName">Game Name</label>
            <input
              id="gameName"
              type="text"
              class="form-input"
              formControlName="gameName"
              placeholder="Enter a name for your game"
            />
            <div *ngIf="gameForm.get('gameName')?.touched && gameForm.get('gameName')?.invalid" class="error-message">
              Game name is required
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="maxPlayers">Maximum Players</label>
            <select
              id="maxPlayers"
              class="form-select"
              formControlName="maxPlayers"
            >
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
              <option value="5">5 Players</option>
              <option value="6">6 Players</option>
            </select>
            <div class="form-hint">TEG supports 3 to 6 players</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="gameMode">Game Mode</label>
            <select
              id="gameMode"
              class="form-select"
              formControlName="gameMode"
            >
              <option value="classic">Classic</option>
              <option value="secret-mission">Secret Mission</option>
            </select>
          </div>

          <button
            type="submit"
            class="submit-button"
            [disabled]="gameForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating Game...' : 'Create Game' }}
          </button>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateGameComponent implements OnInit, OnDestroy {
  gameForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  private wsSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private wsService: WebSocketService,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      gameName: ['', [Validators.required]],
      maxPlayers: ['4', [Validators.required, Validators.min(3), Validators.max(6)]],
      gameMode: ['classic', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Subscribe to WebSocket messages
    this.wsSubscription = this.wsService.messages$.subscribe({
      next: (message) => {
        if (message.type === 'GAME_CREATED') {
          // Navigate to the game lobby
          this.router.navigate(['/game', message.payload.gameId]);
        } else if (message.type === 'ERROR') {
          this.error = message.payload.message;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('WebSocket error:', error);
        this.error = 'Failed to connect to game server';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      this.isLoading = true;
      this.error = null;

      const gameConfig = {
        ...this.gameForm.value,
        maxPlayers: parseInt(this.gameForm.value.maxPlayers, 10)
      };

      this.wsService.createGame(gameConfig);
    }
  }
} 