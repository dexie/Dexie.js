import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { authenticate } from './authentication/authenticate';
import { TSON } from './TSON';
import { DexieCloudDB } from './db/DexieCloudDB';

const USER_INACTIVITY_TIMEOUT = 60000;
const SERVER_PING_TIMEOUT = 20000;
const CLIENT_PING_INTERVAL = 30000;

export type WSConnectionMsg = PingMessage | RevisionChangedMessage | RealmsChangedMessage;
interface PingMessage {
  type: 'ping';
}
export interface RevisionChangedMessage {
  type: 'rev';
  rev: bigint;
}

export interface RealmsChangedMessage {
  type: 'realms';
  realms: string[];
}

export class WSObservable extends Observable<WSConnectionMsg> {
  constructor(
    databaseUrl: string,
    token?: string
  ) {
    super(
      (subscriber) =>
        new WSConnection(databaseUrl, token, subscriber)
    );
  }
}

export class WSConnection extends Subscription {
  ws: WebSocket | null;
  lastServerActivity: Date;
  lastUserActivity: Date;
  lastPing: Date;
  databaseUrl: string;
  token: string | undefined;
  subscriber: Subscriber<WSConnectionMsg>;

  private pinger: any;

  constructor(
    databaseUrl: string,
    token: string | undefined,
    subscriber: Subscriber<WSConnectionMsg>
  ) {
    super(() => this.teardown());
    this.databaseUrl = databaseUrl;
    this.token = token;
    this.subscriber = subscriber;
    this.connect();
    window.addEventListener('mousemove', this.onUserActive);
    window.addEventListener('keydown', this.onUserActive);
  }

  private teardown() {
    this.disconnect();
    window.removeEventListener('mousemove', this.onUserActive);
    window.removeEventListener('keydown', this.onUserActive);
  }

  private disconnect() {
    if (this.pinger) {
      clearInterval(this.pinger);
      this.pinger = null;
    }
    if (
      this.ws &&
      this.ws.readyState !== WebSocket.CLOSED &&
      this.ws.readyState !== WebSocket.CLOSING
    ) {
      try {
        this.ws?.close();
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
    return this.connect();
  }

  async connect() {
    if (this.ws) {
      throw new Error(`Called connect() when a connection is already open`);
    }
    if (!this.databaseUrl)
      throw new Error(`Cannot connect without a database URL`);
    if (this.closed) {
      return;
    }
    this.lastServerActivity = new Date();
    this.pinger = setInterval(async () => {
      if (this.closed) {
        this.teardown();
        return;
      }
      if (this.isUserActive()) {
        if (this.ws) {
          try {
            this.ws.send(TSON.stringify({ type: 'ping' } as PingMessage));
            setTimeout(() => {
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
    const token = this.token;
    if (this.subscriber.closed) return;
    if (token) searchParams.set('token', token);

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
        const msg = TSON.parse(event.data) as WSConnectionMsg;
        if (msg.type !== "ping") {
          this.subscriber.next(msg);
        }
      } catch (e) {
        this.subscriber.error(e);
        this.disconnect();
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = (event) => {
        console.debug('ws onopen');
        resolve(null);
      };
      ws.onerror = (event: ErrorEvent) => {
        console.log('onerror');
        this.subscriber.error(event.error);
        this.disconnect();
        reject(event.error);
      };
    });
  }
}
