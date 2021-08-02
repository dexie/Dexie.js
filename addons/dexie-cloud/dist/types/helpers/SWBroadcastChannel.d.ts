export declare class SWBroadcastChannel {
    name: string;
    constructor(name: string);
    subscribe(listener: (message: any) => void): () => void;
    postMessage(message: any): void;
}
