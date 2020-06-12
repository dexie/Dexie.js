/**
 * API for Dexie.Observable.
 *
 * Contains interfaces used by dexie-observable.
 *
 * By separating module 'dexie-observable' from 'dexie-observable/api' we
 * distinguish that:
 *
 *   import {...} from 'dexie-observable/api' is only for getting access to its
 *                                            interfaces and has no side-effects.
 *                                            Typescript-only import.
 *
 *   import 'dexie-observable' is only for side effects - to extend Dexie with
 *                             functionality of dexie-observable.
 *                             Javascript / Typescript import.
 *
 */
export const enum DatabaseChangeType {
    Create = 1,
    Update = 2,
    Delete = 3,
}

export interface ICreateChange {
    type: DatabaseChangeType.Create;
    table: string;
    key: any;
    obj: any;
    source?: string;
}

export interface IUpdateChange {
    type: DatabaseChangeType.Update;
    table: string;
    key: any;
    mods: { [keyPath: string]: any | undefined };
    obj: any;
    oldObj: any;
    source?: string;
}

export interface IDeleteChange {
    type: DatabaseChangeType.Delete;
    table: string;
    key: any;
    oldObj: any;
    source?: string;
}

export type IDatabaseChange = ICreateChange | IUpdateChange | IDeleteChange;
