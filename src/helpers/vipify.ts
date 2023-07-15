import { type Dexie } from "../classes/dexie";
import { type Table } from "../classes/table";
import { type Transaction } from "../classes/transaction";

export function vipify(
  target: Table | Transaction,
  vipDb: Dexie
): Table {
  return Object.create(target, {db: {value: vipDb}});
}
