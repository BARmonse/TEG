import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GameDTO {
  id: number;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/api/game`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  createGame(gameName: string, maxPlayers: number): Observable<GameDTO> {
    const payload = { gameName, maxPlayers };
    return this.http.post<GameDTO>(
      `${this.apiUrl}/create`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  getAvailableGames(): Observable<GameDTO[]> {
    return this.http.get<GameDTO[]>(
      `${this.apiUrl}/list`,
      { headers: this.getHeaders() }
    );
  }

  getGame(id: number): Observable<GameDTO> {
    return this.http.get<GameDTO>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  joinGame(gameId: number): Observable<GameDTO> {
    return this.http.post<GameDTO>(
      `${this.apiUrl}/join/${gameId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  cancelGame(gameId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${gameId}/leave`,
      { headers: this.getHeaders() }
    );
  }
} 