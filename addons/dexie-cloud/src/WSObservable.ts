import { DBOperationsSet } from 'dexie-cloud-common';
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import { TokenExpiredError } from './authentication/TokenExpiredError';
import { DXCWebSocketStatus } from './DXCWebSocketStatus';
import { TSON } from './TSON';

const SERVER_PING_TIMEOUT = 20000;
const CLIENT_PING_INTERVAL = 30000;
const FAIL_RETRY_WAIT_TIME = 60000;

export type WSClientToServerMsg = ReadyForChangesMessage;
export interface ReadyForChangesMessage {
  type: 'ready';
  rev: string;
}

export type WSConnectionMsg =
  | RevisionChangedMessage
  | RealmAddedMessage
  | RealmRemovedMessage
  | RealmsChangedMessage
  | ChangesFromServerMessage
  | TokenExpiredMessage;
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

export interface ChangesFromServerMessage {
  type: 'changes';
  baseRev: string;
  realmSetHash: string;
  newRev: string;
  changes: DBOperationsSet;
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

export interface RealmsChangedMessage {
  type: 'realms-changed';
  realmsHash: string;
}
export interface TokenExpiredMessage {
  type: 'token-expired';
}

export class WSObservable extends Observable<WSConnectionMsg> {
  constructor(
    databaseUrl: string,
    rev: string,
    realmSetHash: string,
    clientIdentity: string,
    messageProducer: Observable<WSClientToServerMsg>,
    webSocketStatus: BehaviorSubject<DXCWebSocketStatus>,
    token?: string,
    tokenExpiration?: Date,
  ) {
    super(
      (subscriber) =>
        new WSConnection(
          databaseUrl,
          rev,
          realmSetHash,
          clientIdentity,
          token,
          tokenExpiration,
          subscriber,
          messageProducer,
          webSocketStatus
        )
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
  realmSetHash: string;
  clientIdentity: string;
  token: string | undefined;
  tokenExpiration: Date | undefined;
  subscriber: Subscriber<WSConnectionMsg>;
  pauseUntil?: Date;
  messageProducer: Observable<WSClientToServerMsg>;
  webSocketStatus: BehaviorSubject<DXCWebSocketStatus>;
  id = ++counter;

  private pinger: any;
  private messageProducerSubscription: null | Subscription;

  constructor(
    databaseUrl: string,
    rev: string,
    realmSetHash: string,
    clientIdentity: string,
    token: string | undefined,
    tokenExpiration: Date | undefined,
    subscriber: Subscriber<WSConnectionMsg>,
    messageProducer: Observable<WSClientToServerMsg>,
    webSocketStatus: BehaviorSubject<DXCWebSocketStatus>
  ) {
    super(() => this.teardown());
    console.debug(
      'New WebSocket Connection',
      this.id,
      token ? 'authorized' : 'unauthorized'
    );
    this.databaseUrl = databaseUrl;
    this.rev = rev;
    this.realmSetHash = realmSetHash;
    this.clientIdentity = clientIdentity;
    this.token = token;
    this.tokenExpiration = tokenExpiration;
    this.subscriber = subscriber;
    this.lastUserActivity = new Date();
    this.messageProducer = messageProducer;
    this.messageProducerSubscription = null;
    this.webSocketStatus = webSocketStatus;
    this.connect();
  }

  private teardown() {
    console.debug('Teardown WebSocket Connection', this.id);
    this.disconnect();
  }

  private disconnect() {
    this.webSocketStatus.next("disconnected");
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
    if (this.messageProducerSubscription) {
      this.messageProducerSubscription.unsubscribe();
      this.messageProducerSubscription = null;
    }
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  async connect() {
    this.webSocketStatus.next("connecting");
    this.lastServerActivity = new Date();
    if (this.pauseUntil && this.pauseUntil > new Date()) {
      console.debug('WS not reconnecting just yet', {
        id: this.id,
        pauseUntil: this.pauseUntil,
      });
      return;
    }
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
    searchParams.set('v', "2");
    searchParams.set('rev', this.rev);
    searchParams.set('realmsHash', this.realmSetHash);
    searchParams.set('clientId', this.clientIdentity);
    if (this.token) {
      searchParams.set('token', this.token);
    }

    // Connect the WebSocket to given url:
    console.debug('dexie-cloud WebSocket create');
    const ws = (this.ws = new WebSocket(`${wsUrl}/changes?${searchParams}`));
    //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.

    ws.onclose = (event: Event) => {
      if (!this.pinger) return;
      console.debug('dexie-cloud WebSocket onclosed', this.id);
      this.reconnect();
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!this.pinger) return;
      console.debug('dexie-cloud WebSocket onmessage', event.data);

      this.lastServerActivity = new Date();
      try {
        const msg = TSON.parse(event.data) as
          | WSConnectionMsg
          | PongMessage
          | ErrorMessage;
        if (msg.type === 'error') {
          throw new Error(`Error message from dexie-cloud: ${msg.error}`);
        }
        if (msg.type === 'rev') {
          this.rev = msg.rev; // No meaning but seems reasonable.
        }
        if (msg.type !== 'pong') {
          this.subscriber.next(msg);
        }
      } catch (e) {
        this.subscriber.error(e);
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
          this.disconnect();
          this.subscriber.error(error);
          this.webSocketStatus.next("error");
          reject(error);
        };
      });
      this.messageProducerSubscription = this.messageProducer.subscribe(msg => {
        if (!this.closed) {
          if (msg.type === 'ready' && this.webSocketStatus.value !== 'connected') {
            this.webSocketStatus.next("connected");
          }
          this.ws?.send(TSON.stringify(msg));
        }
      });
    } catch (error) {
      this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
    }
  }
}
