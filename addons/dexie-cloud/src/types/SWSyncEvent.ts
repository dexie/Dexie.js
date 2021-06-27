export type SyncEvent = Event & {
  tag: string;
  waitUntil (promise: Promise<any>): void;
}
