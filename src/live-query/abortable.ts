export class Abortable extends AbortController {
  transactions: IDBTransaction[];
  constructor() {
    super();
    this.transactions = [];
    this.signal.addEventListener('abort', () => {
      for (const idbtrans of this.transactions) {
        try {
          idbtrans.abort();
        } catch {}
      }
    });
  }
}
