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
  private client: Client;
  private messagesSubject = new BehaviorSubject<WebSocketMessage>({ type: '', payload: null });
  public messages$ = this.messagesSubject.asObservable();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();
  private activeUsersCount = new BehaviorSubject<number>(0);
  public activeUsersCount$ = this.activeUsersCount.asObservable();

  constructor() {
    this.client = new Client({
      brokerURL: `${environment.wsUrl}/ws/game`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
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

  public send(message: WebSocketMessage): void {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/message',
        body: JSON.stringify(message)
      });
    } else {
      console.warn('WebSocket is not connected, message not sent:', message);
    }
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
    if (this.client) {
      this.deactivate();
    }
  }

  private deactivate(): void {
    this.activeUsersCount.next(0);
    this.client.deactivate();
  }
} 