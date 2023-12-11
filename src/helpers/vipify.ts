import { type Dexie } from "../classes/dexie";
import { type Table } from "../classes/table";
import { type Transaction } from "../classes/transaction";

export function vipify<T extends Table | Transaction>(
  target: T,
  vipDb: Dexie
): T {
  return new Proxy(target, {
    get (target, prop, receiver) {
      // The "db" prop of the table or transaction is the only one we need to
      // override. The rest of the props can be accessed from the original
      // object.
      if (prop === 'db') return vipDb;
      return Reflect.get(target, prop, receiver);
    }
  });
}
