import Dexie, {Collection, Table} from "dexie";
import { DBCoreTable, DBCoreIndex } from "dexie";

export class PageQuery<T> {
  private constructor(public table: DBCoreTable, public index: DBCoreIndex, public lastKey?: any, public lastId?: any, public filter?: (x: T)=>boolean) {}

  async nextPage(limit: number = Infinity): Promise<T[]> {
    
  }
}