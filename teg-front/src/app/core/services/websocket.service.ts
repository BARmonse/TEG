import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client!: Client;
  private messagesSubject = new BehaviorSubject<WebSocketMessage>({ type: '', payload: null });
  public messages$ = this.messagesSubject.asObservable();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();
  private activeUsersCount = new BehaviorSubject<number>(0);
  public activeUsersCount$ = this.activeUsersCount.asObservable();

  constructor() {
    this.initializeWebSocketClient();
  }

  private initializeWebSocketClient() {
    this.client = new Client({
      brokerURL: `${environment.wsUrl}/ws/game`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      onConnect: () => {
        console.log('Connected to STOMP server');
        this.connectionStatus.next(true);
        this.subscribeToTopics();
        // Request initial count after subscribing
        setTimeout(() => {
          this.sendConnect();
          this.requestActiveUsersCount();
        }, 100);
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP server');
        this.connectionStatus.next(false);
        this.activeUsersCount.next(0);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      }
    });

    this.activate();
  }

  private activate(): void {
    this.client.activate();
  }

  private subscribeToTopics(): void {
    // Subscribe to broadcast active users updates
    this.client.subscribe('/topic/active-users', (message: IMessage) => {
      const data = JSON.parse(message.body);
      console.log('Received broadcast active users update:', data);
      this.updateActiveUsersCount(data.count);
    });

    // Subscribe to user-specific active users updates
    this.client.subscribe('/user/queue/active-users', (message: IMessage) => {
      const data = JSON.parse(message.body);
      console.log('Received personal active users update:', data);
      this.updateActiveUsersCount(data.count);
    });

    // Subscribe to game updates
    this.client.subscribe('/topic/game-updates', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.messagesSubject.next(data);
    });

    // Subscribe to user-specific game updates
    this.client.subscribe('/user/queue/game-created', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.messagesSubject.next(data);
    });

    // Subscribe to user-specific game list
    this.client.subscribe('/user/queue/games', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.messagesSubject.next(data);
    });

    // Subscribe to errors
    this.client.subscribe('/user/queue/errors', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.messagesSubject.next({
        type: 'ERROR',
        payload: { message: data.message }
      });
    });
  }

  private updateActiveUsersCount(count: number): void {
    console.log('Updating active users count:', count);
    if (count > 0) {  // Only update if count is greater than 0
      this.activeUsersCount.next(count);
    }
  }

  private requestActiveUsersCount(): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/get-active-users',
        body: JSON.stringify({
          type: 'GET_ACTIVE_USERS',
          payload: {}
        })
      });
    }
  }

  private sendConnect(): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/connect',
        body: JSON.stringify({
          type: 'CONNECT',
          payload: {}
        })
      });
    }
  }

  public createGame(gameConfig: any): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/create-game',
        body: JSON.stringify(gameConfig)
      });
    } else {
      console.warn('WebSocket is not connected, game creation failed:', gameConfig);
    }
  }

  public getGames(): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/get-games',
        body: JSON.stringify({})
      });
    } else {
      console.warn('WebSocket is not connected, cannot fetch games');
    }
  }

  public getGameInfo(gameId: string): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/get-game-info',
        body: JSON.stringify({ gameId })
      });
    } else {
      console.warn('WebSocket is not connected, cannot fetch game info:', gameId);
    }
  }

  public joinGame(gameId: string): void {
    if (this.client.connected) {
      this.client.publish({
        destination: `/app/game/${gameId}/join`,
        body: JSON.stringify({})
      });
    } else {
      console.warn('WebSocket is not connected, cannot join game:', gameId);
    }
  }

  public leaveGame(gameId: string): void {
    if (this.client.connected) {
      this.client.publish({
        destination: `/app/game/${gameId}/leave`,
        body: JSON.stringify({})
      });
    } else {
      console.warn('WebSocket is not connected, cannot leave game:', gameId);
    }
  }

  public startGame(gameId: string): void {
    if (this.client.connected) {
      this.client.publish({
        destination: `/app/game/${gameId}/start`,
        body: JSON.stringify({})
      });
    } else {
      console.warn('WebSocket is not connected, cannot start game:', gameId);
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.deactivate();
    }
  }

  private deactivate(): void {
    this.activeUsersCount.next(0);
    this.client.deactivate();
  }
} 