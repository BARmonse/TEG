import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GameDTO {
  id: number;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  createdAt: string;
  playerUsernames: string[];
  creatorUsername: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/api/game`;

  constructor(private http: HttpClient) {}

  createGame(gameName: string, maxPlayers: number): Observable<GameDTO> {
    const payload = { gameName, maxPlayers };
    return this.http.post<GameDTO>(
      `${this.apiUrl}/create`,
      payload
    );
  }

  getAvailableGames(): Observable<GameDTO[]> {
    return this.http.get<GameDTO[]>(
      `${this.apiUrl}/list`
    );
  }

  getGame(id: number): Observable<GameDTO> {
    return this.http.get<GameDTO>(
      `${this.apiUrl}/${id}`
    );
  }

  joinGame(gameId: number): Observable<GameDTO> {
    return this.http.post<GameDTO>(
      `${this.apiUrl}/join/${gameId}`,
      null
    );
  }

  cancelGame(gameId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${gameId}/leave`
    );
  }
} 