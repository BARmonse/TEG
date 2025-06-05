import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if we have a stored user on initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, { headers })
      .pipe(
        tap(user => {
          console.log('Login successful:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData, { headers })
      .pipe(
        tap(user => {
          console.log('Registration successful:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  getAuthToken(): string | null {
    return this.currentUserValue?.token ?? null;
  }

  getCurrentUser(): Observable<AuthResponse> {
    console.log('Fetching current user info');
    return this.http.get<AuthResponse>(`${this.API_URL}/me`).pipe(
      tap(user => {
        console.log('Current user info:', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
} 