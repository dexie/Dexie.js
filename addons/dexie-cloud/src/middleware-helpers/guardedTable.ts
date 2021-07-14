import { DBCoreTable, DBCoreTransaction } from "dexie";
import { allSettled } from "../helpers/allSettled";

let counter = 0;

export function guardedTable(table: DBCoreTable) {
  const prop = "$lock"+ (++counter);
  return {
    ...table,
    count: readLock(table.count, prop),
    get: readLock(table.get, prop),
    getMany: readLock(table.getMany, prop),
    openCursor: readLock(table.openCursor, prop),
    query: readLock(table.query, prop),
    mutate: writeLock(table.mutate, prop),
  };
}

function readLock<TReq extends { trans: DBCoreTransaction }, TRes>(
  fn: (req: TReq) => Promise<TRes>,
  prop: string
): (req: TReq) => Promise<TRes> {
  return function readLocker(req): Promise<TRes> {
    const {
      readers,
      writers,
    }: { writers: Promise<any>[]; readers: Promise<any>[] } =
      req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] });
    const numWriters = writers.length;
    const promise = (numWriters > 0
      ? writers[numWriters - 1].then(() => fn(req), () => fn(req))
      : fn(req)
    ).finally(() => readers.splice(readers.indexOf(promise)));
    readers.push(promise);
    return promise;
  };
}

function writeLock<TReq extends { trans: DBCoreTransaction }, TRes>(
  fn: (req: TReq) => Promise<TRes>,
  prop: string
): (req: TReq) => Promise<TRes> {
  return function writeLocker(req): Promise<TRes> {
    const {
      readers,
      writers,
    }: { writers: Promise<any>[]; readers: Promise<any>[] } =
      req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] });
    let promise = (writers.length > 0
      ? writers[writers.length - 1].then(() => fn(req), () => fn(req))
      : readers.length > 0
      ? allSettled(readers).then(() => fn(req))
      : fn(req)
    ).finally(() => writers.shift());
    writers.push(promise);
    return promise;
  };
}
