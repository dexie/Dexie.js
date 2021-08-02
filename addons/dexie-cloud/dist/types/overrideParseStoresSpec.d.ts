import Dexie, { DbSchema } from 'dexie';
export declare function overrideParseStoresSpec(origFunc: Function, dexie: Dexie): (stores: {
    [tableName: string]: string;
}, dbSchema: DbSchema) => any;
