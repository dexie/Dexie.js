import { Observable, Subscriber, Subscription } from 'rxjs';
import { TokenExpiredError } from './authentication/TokenExpiredError';

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
    console.debug(
      'New WebSocket Connection',
      this.id,
      token ? 'authorized' : 'unauthorized'
    );
    this.databaseUrl = databaseUrl;
    this.rev = rev;
    this.token = token;
    this.tokenExpiration = tokenExpiration;
    this.subscriber = subscriber;
    this.lastUserActivity = new Date();
    this.connect();
  }

  private teardown() {
    this.disconnect();
    console.debug('Teardown WebSocket Connection', this.id);
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
        console.debug('pinger check', this.id, 'CLOSED.');
        this.teardown();
        return;
      }
      if (this.ws) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' } as PingMessage));
          setTimeout(() => {
            console.debug(
              'pinger setTimeout',
              this.id,
              this.pinger ? `alive` : 'dead'
            );
            if (!this.pinger) return;
            if (this.closed) {
              console.debug(
                'pinger setTimeout',
                this.id,
                'subscription is closed'
              );
              this.teardown();
              return;
            }
            if (
              this.lastServerActivity <
              new Date(Date.now() - SERVER_PING_TIMEOUT)
            ) {
              // Server inactive. Reconnect if user is active.
              console.debug('pinger: server is inactive');
              console.debug('pinger reconnecting');
              this.reconnect();
            } else {
              console.debug('pinger: server still active');
            }
          }, SERVER_PING_TIMEOUT);
        } catch {
          console.debug('pinger catch error', this.id, 'reconnecting');
          this.reconnect();
        }
      } else {
        console.debug('pinger', this.id, 'reconnecting');
        this.reconnect();
      }
    }, CLIENT_PING_INTERVAL);

    // The following vars are needed because we must know which callback to ack when server sends it's ack to us.
    const wsUrl = new URL(this.databaseUrl);
    wsUrl.protocol = wsUrl.protocol === 'http:' ? 'ws' : 'wss';
    const searchParams = new URLSearchParams();
    if (this.subscriber.closed) return;
    searchParams.set('rev', this.rev);
    if (this.token) {
      searchParams.set('token', this.token);
    }

    // Connect the WebSocket to given url:
    console.debug('dexie-cloud WebSocket create');
    const ws = (this.ws = new WebSocket(`${wsUrl}/revision?${searchParams}`));
    //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.

    ws.onclose = (event: Event) => {
      if (!this.pinger) return;
      console.debug('dexie-cloud WebSocket onclosed');
      this.reconnect();
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!this.pinger) return;
      console.debug('dexie-cloud WebSocket onmessage', event.data);
      
      this.lastServerActivity = new Date();
      try {
        const msg = JSON.parse(event.data) as
          | WSConnectionMsg
          | PongMessage
          | ErrorMessage;
        if (msg.type === 'error') {
          throw new Error(`dexie-cloud WebSocket Error ${msg.error}`);
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
          console.debug('dexie-cloud WebSocket onopen');
          resolve(null);
        };
        ws.onerror = (event: ErrorEvent) => {
          const error = event.error || new Error('WebSocket Error');
          console.debug('dexie-cloud WebSocket error', error);
          this.disconnect();
          reject(error);
        };
      });
    } catch (error) {
      this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
    }
  }
}
