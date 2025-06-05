import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
    }
    .form-container {
      max-width: 32rem;
      margin: 0 auto;
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .form-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
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
      padding: 0.5rem;
      border: 1px solid #D1D5DB;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    .form-input:focus {
      outline: none;
      border-color: #2563EB;
      ring: 2px solid #2563EB;
    }
    .error-message {
      color: #DC2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #2563EB;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .submit-button:hover {
      background-color: #1D4ED8;
    }
    .submit-button:disabled {
      background-color: #93C5FD;
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="form-container">
      <h2 class="form-title">Create New Game</h2>
      <form [formGroup]="gameForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="gameName">Game Name</label>
          <input
            id="gameName"
            type="text"
            class="form-input"
            formControlName="gameName"
            placeholder="Enter game name"
          >
          <div *ngIf="gameForm.get('gameName')?.touched && gameForm.get('gameName')?.errors?.['required']" class="error-message">
            Game name is required
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="maxPlayers">Maximum Players</label>
          <select
            id="maxPlayers"
            class="form-input"
            formControlName="maxPlayers"
          >
            <option value="2">2 Players</option>
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
            <option value="5">5 Players</option>
            <option value="6">6 Players</option>
          </select>
        </div>

        <button
          type="submit"
          class="submit-button"
          [disabled]="gameForm.invalid || isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create Game' }}
        </button>
      </form>
    </div>
  `
})
export class CreateGameComponent {
  gameForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private wsService: WebSocketService,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      gameName: ['', [Validators.required]],
      maxPlayers: [6, [Validators.required, Validators.min(2), Validators.max(6)]]
    });
  }

  onSubmit() {
    if (this.gameForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { gameName, maxPlayers } = this.gameForm.value;

      this.gameService.createGame(gameName, maxPlayers).subscribe({
        next: (game) => {
          console.log('Game created:', game);
          this.router.navigate(['/games', game.id, 'lobby']);
        },
        error: (error) => {
          console.error('Error creating game:', error);
          this.isLoading = false;
        }
      });
    }
  }
} 