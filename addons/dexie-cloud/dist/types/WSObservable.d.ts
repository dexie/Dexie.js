import { Observable, Subscriber, Subscription } from 'rxjs';
export declare type WSConnectionMsg = RevisionChangedMessage | RealmAddedMessage | RealmRemovedMessage;
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
export declare class WSObservable extends Observable<WSConnectionMsg> {
    constructor(databaseUrl: string, rev: string, token?: string, tokenExpiration?: Date);
}
export declare class WSConnection extends Subscription {
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
    id: number;
    private pinger;
    constructor(databaseUrl: string, rev: string, token: string | undefined, tokenExpiration: Date | undefined, subscriber: Subscriber<WSConnectionMsg>);
    private teardown;
    private disconnect;
    reconnect(): void;
    connect(): Promise<void>;
}
