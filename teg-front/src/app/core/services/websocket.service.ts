import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject, Subject, timer } from 'rxjs';
import { retryWhen, delayWhen, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$!: WebSocketSubject<WebSocketMessage>;
  private messagesSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messagesSubject.asObservable();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();
  private activeUsersCount = new BehaviorSubject<number>(0);
  public activeUsersCount$ = this.activeUsersCount.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket<WebSocketMessage>({
        url: `${environment.wsUrl}/game`,
        openObserver: {
          next: () => {
            console.log('WebSocket connection established');
            this.connectionStatus.next(true);
            this.requestActiveUsersCount();
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket connection closed');
            this.connectionStatus.next(false);
            this.reconnect();
          }
        }
      });

      this.socket$.pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(err => console.error('WebSocket error:', err)),
            delayWhen(() => timer(1000))
          )
        )
      ).subscribe({
        next: (message) => {
          if (message.type === 'ACTIVE_USERS_COUNT') {
            this.activeUsersCount.next(message.payload.count);
          }
          this.messagesSubject.next(message);
        },
        error: (error) => console.error('WebSocket error:', error)
      });
    }
  }

  private reconnect(): void {
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, 1000);
  }

  public send(message: WebSocketMessage): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.warn('WebSocket is not connected, attempting to reconnect...');
      this.connect();
      setTimeout(() => this.send(message), 1000);
    }
  }

  private requestActiveUsersCount(): void {
    this.send({
      type: 'GET_ACTIVE_USERS_COUNT',
      payload: {}
    });
  }

  public joinGame(gameId: string): void {
    this.send({
      type: 'JOIN_GAME',
      payload: { gameId }
    });
  }

  public createGame(gameConfig: any): void {
    this.send({
      type: 'CREATE_GAME',
      payload: gameConfig
    });
  }

  public leaveGame(gameId: string): void {
    this.send({
      type: 'LEAVE_GAME',
      payload: { gameId }
    });
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
} 