export interface SWMessageEvent extends MessageEvent {
  waitUntil(promise: Promise<any>): void;
}
