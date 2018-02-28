import { DBCore, ObjectStore, WriteResponse, GetAllQuery, OpenCursorQuery } from './L1-dbcore/dbcore';


export interface Transformer {
  encapsulate?: (store: ObjectStore, values: any[]) => Promise<any[]>,
  revive?: (store: ObjectStore, values: any[]) => Promise<any[]>,
  encapsulateKeys?: (store: ObjectStore, keys: any[]) => Promise<any[]>,
  reviveKeys?: (store: ObjectStore, keys: any[]) => Promise<any[]>
}
/*
export function createTransformation ({
  encapsulate,
  revive,
  encapsulateKeys,
  reviveKeys}: Transformer) : Partial<IDBCore>
{
  function writeFilter (store: ObjectStore, )
  return {
    put
  };
}
*/

export function createTransformationMiddleware (= {
  name: "transformation",
  // type: "core", // Om denna helper är del av IDBCore så ska vi inte ange Dexie-style properties.
  level: 1,
  create (next: DBCore) {
    return {
      add(store: ObjectStore, values: any[], keys?: any[]): Promise<WriteResponse> {

        return next.add(store, values, keys);
      },
      put(store: ObjectStore, values: any[], keys?: any[]): Promise<WriteResponse> {
        return next.put(store, values, keys);
      },
      delete(store: ObjectStore, keys: any[]): Promise<void> {
        throw new Error("Method not implemented.");
      },
      get(store: ObjectStore, keys: any[]): Promise<any[]> {
        throw new Error("Method not implemented.");
      },
      getAll(store: ObjectStore, req: GetAllQuery): Promise<any[]> {
        throw new Error("Method not implemented.");
      },
      openCursor(store: ObjectStore, req: OpenCursorQuery): void {
        throw new Error("Method not implemented.");
      },
      cmp(a: any, b: any): number {
        throw new Error("Method not implemented.");
      } 
    } as Partial<DBCore>;
  }
}
