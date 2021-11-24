import { Dexie, TableProp } from './dexie';

export class Entity<TDexieSubClass extends Dexie=Dexie> {
  protected constructor();
  protected readonly db: TDexieSubClass;
  table(): TableProp<TDexieSubClass>;
}
