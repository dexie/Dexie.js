import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { authenticate } from './authentication/authenticate';
import { TSON } from './BISON';
import { DexieCloudDB } from './db/DexieCloudDB';

const USER_INACTIVITY_TIMEOUT = 60000;
const SERVER_PING_TIMEOUT = 20000;
const CLIENT_PING_INTERVAL = 30000;

export type WSConnectionMsg = PingMessage | RevisionMessage;
interface PingMessage {
  type: 'ping';
}
interface RevisionMessage {
  type: 'rev';
  value: bigint;
}

export class WSRevObservable extends Observable<bigint> {
  constructor(databaseUrl: string, token: string) {
    super(subscriber => new WSRevConnection(databaseUrl, token, subscriber))
  }
}
export class WSRevConnection extends Subscription {
  ws: WebSocket | null;
  lastServerActivity: Date;
  lastUserActivity: Date;
  lastPing: Date;
  databaseUrl: string;
  token: string;
  closed: boolean;
  subscriber: Subscriber<bigint>;

  private pinger: any;

  constructor(databaseUrl: string, token: string, subscriber: Subscriber<bigint>) {
    super(()=>this.teardown());
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
    this.connect();
  }

  connect() {
    if (this.ws) {
      throw new Error(`Called connect() when a connection is already open`);
    }
    if (!this.databaseUrl)
      throw new Error(`Cannot reconnect without a database URL`);
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
    if (this.token) searchParams.set('token', this.token);

    // Connect the WebSocket to given url:
    console.debug('ws create');
    const ws = (this.ws = new WebSocket(`${wsUrl}/revision?${searchParams}`));
    //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.

    /*
    ws.onopen = (event) => {
      console.debug("ws onopen");
    };*/

    // If network down or other error, tell the framework to reconnect again in some time:
    ws.onerror = (event: ErrorEvent) => {
      console.log('onerror');
      this.subscriber.error(event.error);
      this.disconnect();
    };

    ws.onclose = (event: Event) => {
      console.log('onclose');
      this.disconnect();
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log('onmessage', event.data);
      this.lastServerActivity = new Date();
      try {
        // Assume we have a server that should send JSON messages of the following format:
        // {
        //     type: "clientIdentity", "changes", "ack" or "error"
        //     clientIdentity: unique value for our database client node to persist in the context. (Only applicable if type="clientIdentity")
        //     message: Error message (Only applicable if type="error")
        //     requestId: ID of change request that is acked by the server (Only applicable if type="ack" or "error")
        //     changes: changes from server (Only applicable if type="changes")
        //     lastRevision: last revision of changes sent (applicable if type="changes")
        //     partial: true if server has additionalChanges to send. False if these changes were the last known. (applicable if type="changes")
        // }
        const msg = TSON.parse(event.data) as WSConnectionMsg;
        switch (msg.type) {
          case 'ping':
            break;
          case 'rev':
            this.subscriber.next(msg.value);
            break;
        }
      } catch (e) {
        this.subscriber.error(e);
        this.disconnect();
      }
    };
  }
}
