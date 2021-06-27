export interface DexieEvent {
  subscribers: Function[];
  fire(...args:any[]): any;
  subscribe(fn: (...args:any[]) => any): void;
  unsubscribe(fn: (...args:any[]) => any): void;
}
