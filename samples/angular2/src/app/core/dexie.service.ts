import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('Ng2DexieSample');
    this.version(1).stores({
      todos: '++id',
    });
  }
}
