import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameDTO, UserDTO, GamePlayerDTO } from '../dto/game.dto';

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

  joinGame(gameId: number, userId: number): Observable<GameDTO> {
    return this.http.post<GameDTO>(
      `${this.apiUrl}/join/${gameId}/${userId}`,
      null
    );
  }

  leaveGame(gameId: number, userId: number): Observable<GameDTO> {
    return this.http.post<GameDTO>(
      `${this.apiUrl}/leave/${gameId}/${userId}`, null
    );
  }

  updatePlayerColor(gameId: number, userId: number, color: string): Observable<GamePlayerDTO> {
    return this.http.post<GamePlayerDTO>(
      `${this.apiUrl}/color/${gameId}/${userId}`,
      { color }
    );
  }
} 