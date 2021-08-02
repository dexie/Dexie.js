export declare type SyncEvent = Event & {
    tag: string;
    waitUntil(promise: Promise<any>): void;
};
