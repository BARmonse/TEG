import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  animations: [
    trigger('errorAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0,
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%) translateY(-20px)'
        }),
        animate('300ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateX(-50%) translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ 
          opacity: 0, 
          transform: 'translateX(-50%) translateY(-20px)'
        }))
      ])
    ])
  ],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
    }
    .form-container {
      max-width: 28rem;
      margin: 0 auto;
      padding: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    .form-title {
      font-size: 1.875rem;
      font-weight: bold;
      text-align: center;
      color: #111827;
      margin-bottom: 2rem;
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
    .form-input.error {
      border-color: #ef4444;
    }
    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .submit-button {
      width: 100%;
      padding: 0.5rem 1rem;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .submit-button:hover {
      background-color: #4f46e5;
    }
    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .login-link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: #6366f1;
      font-size: 0.875rem;
      text-decoration: none;
    }
    .login-link:hover {
      color: #4f46e5;
    }
  `],
  template: `
    <div class="container">
      <div *ngIf="error" @errorAnimation class="error-popup">
        <div style="background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 0.375rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <p style="margin: 0; font-size: 0.875rem; font-weight: 500;">
            {{ error }}
          </p>
        </div>
      </div>
      
      <div class="form-container">
        <h2 class="form-title">Create your account</h2>
        <form (ngSubmit)="onSubmit()" [formGroup]="registerForm" autocomplete="off" spellcheck="false">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              id="username"
              type="text"
              class="form-input"
              [class.error]="showError('username')"
              formControlName="username"
              placeholder="Choose a username"
              autocomplete="off"
              readonly
              onfocus="this.removeAttribute('readonly');"
            />
            <div *ngIf="showError('username')" class="error-message">
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="form-input"
              [class.error]="showError('email')"
              formControlName="email"
              placeholder="Enter your email"
              autocomplete="off"
              readonly
              onfocus="this.removeAttribute('readonly');"
            />
            <div *ngIf="showError('email')" class="error-message">
              {{ getErrorMessage('email') }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              [type]="'password'"
              class="form-input"
              [class.error]="showError('password')"
              formControlName="password"
              placeholder="Create a password"
              autocomplete="off"
              readonly
              onfocus="this.removeAttribute('readonly');"
            />
            <div *ngIf="showError('password')" class="error-message">
              Password must be at least 6 characters
            </div>
          </div>

          <button
            type="submit"
            class="submit-button"
            [disabled]="registerForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>

          <a routerLink="/auth/login" class="login-link">
            Already have an account? Sign in
          </a>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field) return '';
    
    if (field.hasError('required')) {
      return 'Email is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Registration error:', error);
          if (error.error && typeof error.error === 'object') {
            this.error = error.error.message || 'An error occurred during registration';
          } else {
            this.error = error.error || 'An error occurred during registration';
          }
          this.isLoading = false;
          setTimeout(() => {
            this.error = null;
          }, 3000);
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 