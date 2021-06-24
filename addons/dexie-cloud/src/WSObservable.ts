import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { authenticate, loadAccessToken } from './authentication/authenticate';
import { TokenExpiredError } from './authentication/TokenExpiredError';
import { DexieCloudDB } from './db/DexieCloudDB';

const USER_INACTIVITY_TIMEOUT = 300_000; // 300_000;
const SERVER_PING_TIMEOUT = 20000;
const CLIENT_PING_INTERVAL = 30000;
const FAIL_RETRY_WAIT_TIME = 60000;

export type WSConnectionMsg =
  | RevisionChangedMessage
  | RealmAddedMessage
  | RealmRemovedMessage;
interface PingMessage {
  type: 'ping';
}

interface PongMessage {
  type: 'pong';
}

interface ErrorMessage {
  type: 'error';
  error: string;
}
export interface RevisionChangedMessage {
  type: 'rev';
  rev: string;
}

export interface RealmAddedMessage {
  type: 'realm-added';
  realm: string;
}

export interface RealmRemovedMessage {
  type: 'realm-removed';
  realm: string;
}

export class WSObservable extends Observable<WSConnectionMsg> {
  constructor(
    databaseUrl: string,
    rev: string,
    token?: string,
    tokenExpiration?: Date
  ) {
    super(
      (subscriber) =>
        new WSConnection(databaseUrl, rev, token, tokenExpiration, subscriber)
    );
  }
}

let counter = 0;

export class WSConnection extends Subscription {
  ws: WebSocket | null;
  lastServerActivity: Date;
  lastUserActivity: Date;
  lastPing: Date;
  databaseUrl: string;
  rev: string;
  token: string | undefined;
  tokenExpiration: Date | undefined;
  subscriber: Subscriber<WSConnectionMsg>;
  pauseUntil?: Date;
  id = ++counter;

  private pinger: any;

  constructor(
    databaseUrl: string,
    rev: string,
    token: string | undefined,
    tokenExpiration: Date | undefined,
    subscriber: Subscriber<WSConnectionMsg>
  ) {
    super(() => this.teardown());
    console.debug('New WebSocket Connection', this.id, token);
    this.databaseUrl = databaseUrl;
    this.rev = rev;
    this.token = token;
    this.tokenExpiration = tokenExpiration;
    this.subscriber = subscriber;
    this.connect();
    window.addEventListener('mousemove', this.onUserActive);
    window.addEventListener('keydown', this.onUserActive);
    window.addEventListener('wheel', this.onUserActive);
  }

  private teardown() {
    console.debug('Teardown WebSocket Connection', this.id);
    this.disconnect();
    window.removeEventListener('mousemove', this.onUserActive);
    window.removeEventListener('keydown', this.onUserActive);
    window.removeEventListener('wheel', this.onUserActive);
  }

  private disconnect() {
    if (this.pinger) {
      clearInterval(this.pinger);
      this.pinger = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }
    this.ws = null;
  }

  isUserActive() {
    return (
      this.lastUserActivity >= new Date(Date.now() - USER_INACTIVITY_TIMEOUT)
    );
  }

  private onUserActive = () => {
    this.lastUserActivity = new Date();
    if (!this.ws) {
      if (this.databaseUrl) {
        this.reconnect();
      }
    } else {
      if (
        this.lastPing < new Date(Date.now() - SERVER_PING_TIMEOUT) &&
        this.lastServerActivity < this.lastPing
      ) {
        this.reconnect();
      }
    }
  };

  reconnect() {
    this.disconnect();
    this.connect();
  }

  async connect() {
    this.lastServerActivity = new Date();
    if (this.pauseUntil && this.pauseUntil > new Date()) return;
    if (this.ws) {
      throw new Error(`Called connect() when a connection is already open`);
    }
    if (!this.databaseUrl)
      throw new Error(`Cannot connect without a database URL`);
    if (this.closed) {
      return;
    }
    if (this.tokenExpiration && this.tokenExpiration < new Date()) {
      this.subscriber.error(new TokenExpiredError()); // Will be handled in connectWebSocket.ts.
      return;
    }
    this.pinger = setInterval(async () => {
      if (this.closed) {
        this.teardown();
        return;
      }
      if (this.isUserActive()) {
        if (this.ws) {
          try {
            this.ws.send(JSON.stringify({ type: 'ping' } as PingMessage));
            setTimeout(() => {
              if (!this.pinger) return;
              if (this.closed) {
                this.teardown();
                return;
              }
              if (
                this.lastServerActivity <
                new Date(Date.now() - SERVER_PING_TIMEOUT)
              ) {
                // Server inactive. Reconnect if user is active.
                if (this.isUserActive()) {
                  this.reconnect();
                } else {
                  this.disconnect();
                }
              }
            }, SERVER_PING_TIMEOUT);
          } catch {
            this.reconnect();
          }
        } else {
          this.reconnect();
        }
      } else {
        // User not active
        this.disconnect();
      }
    }, CLIENT_PING_INTERVAL);

    // The following vars are needed because we must know which callback to ack when server sends it's ack to us.
    const wsUrl = new URL(this.databaseUrl);
    wsUrl.protocol = wsUrl.protocol === 'https' ? 'wss' : 'ws';
    const searchParams = new URLSearchParams();
    if (this.subscriber.closed) return;
    searchParams.set('rev', this.rev);
    if (this.token) {
      searchParams.set('token', this.token);
    }

    // Connect the WebSocket to given url:
    console.debug('ws create');
    const ws = (this.ws = new WebSocket(`${wsUrl}/revision?${searchParams}`));
    //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.

    ws.onclose = (event: Event) => {
      console.log('onclose');
      this.disconnect();
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log('onmessage', event.data);
      this.lastServerActivity = new Date();
      try {
        const msg = JSON.parse(event.data) as
          | WSConnectionMsg
          | PongMessage
          | ErrorMessage;
        if (msg.type === 'error') {
          throw new Error(`WebSocket Error ${msg.error}`);
        }
        if (msg.type === 'rev') {
          this.rev = msg.rev; // No meaning but seems reasonable.
        }
        if (msg.type !== 'pong') {
          this.subscriber.next(msg);
        }
      } catch (e) {
        this.disconnect();
        this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
      }
    };

    try {
      await new Promise((resolve, reject) => {
        ws.onopen = (event) => {
          console.debug('ws onopen');
          resolve(null);
        };
        ws.onerror = (event: ErrorEvent) => {
          const error = event.error || new Error('WebSocket Error');
          console.warn('WebSocket error', error);
          this.disconnect();
          reject(error);
        };
      });
    } catch (error) {
      this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
    }
  }
}
