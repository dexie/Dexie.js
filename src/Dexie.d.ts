﻿// Type definitions for Dexie v{version}
// Project: https://github.com/dfahlander/Dexie.js
// Definitions by: David Fahlander <http://github.com/dfahlander>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface Thenable<R> {
    then<U>(onFulfilled: (value: R) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
    then<U>(onFulfilled: (value: R) => U, onRejected: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Thenable<U>;
}

declare type IndexableTypePart = string | number | Date | Array<Array<void>>;
declare type IndexableTypeArray = Array<IndexableTypePart>;
declare type IndexableTypeArrayReadonly = ReadonlyArray<IndexableTypePart>;
declare type IndexableType = IndexableTypePart | IndexableTypeArrayReadonly;

declare class Dexie {
    constructor(databaseName: string, options?: {
        addons?: Array<(db: Dexie) => void>,
        autoOpen?: boolean,
        indexedDB?: IDBFactory,
        IDBKeyRange?: IDBKeyRange
    });

    name: string;
    tables: Dexie.Table<any, any>[];
    verno: number;

    static addons: Array<(db: Dexie) => void>;
    static version: number;
    static semVer: string;
    static currentTransaction: Dexie.Transaction;

    static getDatabaseNames(): Dexie.Promise<Array<string>>;

    static getDatabaseNames<U>(onFulfilled: (value: Array<string>) => Thenable<U>): Dexie.Promise<U>;

    static getDatabaseNames<U>(onFulfilled: (value: Array<string>) => U): Dexie.Promise<U>;

    static override<F> (origFunc:F, overridedFactory: (fn:any)=>any) : F;
    
    static getByKeyPath(obj: Object, keyPath: string): any;

    static setByKeyPath(obj: Object, keyPath: string, value: any): void;

    static delByKeyPath(obj: Object, keyPath: string): void;

    static shallowClone<T> (obj: T): T;

    static deepClone<T>(obj: T): T;
    
    static asap(fn: Function) : void;
    
    static maxKey: Array<Array<void>> | string;
    static minKey: number;
    
    static dependencies: {
        indexedDB: IDBFactory,
        IDBKeyRange: IDBKeyRange,
        localStorage?: Storage
    };
        
    static default: Dexie;
    
    version(versionNumber: Number): Dexie.Version;

    on: {
        (eventName: string, subscriber: Function, ...args : any[]): void;
        (eventName: 'ready', subscriber: () => any, bSticky: boolean): void;
        (eventName: 'error', subscriber: (error: any) => any): void;
        (eventName: 'populate', subscriber: () => any): void;
        (eventName: 'blocked', subscriber: () => any): void;
        (eventName: 'versionchange', subscriber: (event: IDBVersionChangeEvent) => any): void;
        ready: Dexie.DexieOnReadyEvent;
        error: Dexie.DexieErrorEvent;
        populate: Dexie.DexieEvent;
        blocked: Dexie.DexieEvent;
        versionchange: Dexie.DexieVersionChangeEvent;
    }

    open(): Dexie.Promise<Dexie>;

    table(tableName: string): Dexie.Table<any, any>;

    table<T>(tableName: string): Dexie.Table<T, any>;

    table<T, Key>(tableName: string): Dexie.Table<T, Key>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, scope: () => Thenable<U>): Dexie.Promise<U>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, scope: () => Thenable<U>): Dexie.Promise<U>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, table3: Dexie.Table<any, any>, scope: () => Thenable<U>): Dexie.Promise<U>;

    transaction<U>(mode: string, tables: Dexie.Table<any, any>[], scope: () => Thenable<U>): Dexie.Promise<U>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, scope: () => U): Dexie.Promise<U>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, scope: () => U): Dexie.Promise<U>;

    transaction<U>(mode: string, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, table3: Dexie.Table<any, any>, scope: () => U): Dexie.Promise<U>;

    transaction<U>(mode: string, tables: Dexie.Table<any, any>[], scope: () => U): Dexie.Promise<U>;

    close(): void;

    delete(): Dexie.Promise<void>;

    exists(name : string) : Dexie.Promise<boolean>;

    isOpen(): boolean;

    hasFailed(): boolean;

    backendDB(): IDBDatabase;

    vip<U>(scopeFunction: () => U): U;
    
    // Make it possible to touch physical class constructors where they reside - as properties on db instance.
    // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
    Table : new()=>Dexie.Table<any,any>;
    WhereClause: new()=>Dexie.WhereClause<any,any>;
    Version: new()=>Dexie.Version;
    Transaction: new()=>Dexie.Transaction;
    Collection: new()=>Dexie.Collection<any,any>;
}

declare module Dexie {

    class Promise<R> implements Thenable<R> {
        constructor(callback: (resolve: (value?: Thenable<R>) => void, reject: (error?: any) => void) => void);

        constructor(callback: (resolve: (value?: R) => void, reject: (error?: any) => void) => void);

        then<U>(onFulfilled: (value: R) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Promise<U>;

        then<U>(onFulfilled: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Promise<U>;

        then<U>(onFulfilled: (value: R) => U, onRejected: (error: any) => Thenable<U>): Promise<U>;

        then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Promise<U>;
        
        catch<U>(onRejected: (error: any) => Thenable<U>): Promise<R|U>;
        
        catch<U>(onRejected: (error: any) => U): Promise<R|U>;
        
        catch<U,ET>(ExceptionType: (new() => ET), onRejected: (error: ET) => Promise<U>): Promise<R|U>;

        catch<U,ET>(ExceptionType: (new() => ET), onRejected: (error: ET) => U): Promise<R|U>;

        catch<U>(errorName: string, onRejected: (error: {name: string}) => Promise<U>): Promise<R|U>;

        catch<U>(errorName: string, onRejected: (error: {name: string}) => U): Promise<R|U>;

        finally(onFinally: () => any): Promise<R>;

        onuncatched: () => any;
    }

    module Promise {
        function resolve<R>(value?: Thenable<R>): Promise<R>;

        function resolve<R>(value?: R): Promise<R>;

        function reject(error: any): Promise<any>;

        function all<R>(promises: Thenable<R>[]): Promise<R[]>;

        function all<R>(...promises: Thenable<R>[]): Promise<R[]>;

        function race<R>(promises: Thenable<R>[]): Promise<R>;

        function newPSD<R>(scope: () => R): R;

        var PSD: any;

        var on: {
            (eventName: string, subscriber: Function): void;
            (eventName: 'error', subscriber: (error: any) => any): void;
            error: DexieErrorEvent;
        }
    }


    interface Version {
        stores(schema: { [key: string]: string }): Version;
        upgrade(fn: (trans: Transaction) => void): Version;
    }

    interface Transaction {
        active: boolean;
        db: Dexie;
        mode: string;
        idbtrans: IDBTransaction;
        tables: { [type: string]: Table<any, any> };
        storeNames: Array<string>;
        on: {
            (eventName: string, subscriber: (...args:any[]) => any): void;
            (eventName: 'complete', subscriber: () => any): void;
            (eventName: 'abort', subscriber: () => any): void;
            (eventName: 'error', subscriber: (error:any) => any): void;
            complete: DexieEvent;
            abort: DexieEvent;
            error: DexieEvent;
        }
        abort(): void;
        table(tableName: string): Table<any, any>;
        table<T>(tableName: string): Table<T, any>;
        table<T, Key>(tableName: string): Table<T, Key>;
    }

    interface DexieEvent {
        subscribe(fn: (...args:any[]) => any): void;
        unsubscribe(fn: (...args:any[]) => any): void;
        fire(...args:any[]): any;
    }

    interface DexieErrorEvent {
        subscribe(fn: (error: any) => any): void;
        unsubscribe(fn: (error: any) => any): void;
        fire(error: any): any;
    }

    interface DexieVersionChangeEvent {
        subscribe(fn: (event: IDBVersionChangeEvent) => any): void;
        unsubscribe(fn: (event: IDBVersionChangeEvent) => any): void;
        fire(event: IDBVersionChangeEvent): any;
    }

    interface DexieOnReadyEvent {
        subscribe(fn: () => any, bSticky: boolean): void;
        unsubscribe(fn: () => any): void;
        fire(): any;
    }

    interface Table<T, Key> {
        name: string;
        schema: TableSchema;
        hook: {
            (eventName: string, subscriber: (...args:any[]) => any): void;
            (eventName: 'creating', subscriber: (primKey:Key, obj:T, transaction:Transaction) => any): void;
            (eventName: 'reading', subscriber: (obj:T) => T | any): void;
            (eventName: 'updating', subscriber: (modifications:Object, primKey:Key, obj:T, transaction:Transaction) => any): void;
            (eventName: 'deleting', subscriber: (primKey:Key, obj:T, transaction:Transaction) => any): void;
            creating: DexieEvent;
            reading: DexieEvent;
            updating: DexieEvent;
            deleting: DexieEvent;
        }

        get(key: Key): Promise<T | undefined>;
        where(index: string): WhereClause<T, Key>;

        filter(fn: (obj: T) => boolean): Collection<T, Key>;

        count(): Promise<number>;
        count<U>(onFulfilled: (value: number) => Thenable<U>): Promise<U>;
        count<U>(onFulfilled: (value: number) => U): Promise<U>;

        offset(n: number): Collection<T, Key>;

        limit(n: number): Collection<T, Key>;

        each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;

        toArray(): Promise<Array<T>>;
        toArray<U>(onFulfilled: (value: Array<T>) => Thenable<U>): Promise<U>;
        toArray<U>(onFulfilled: (value: Array<T>) => U): Promise<U>;

        toCollection(): Collection<T, Key>;
        orderBy(index: string): Collection<T, Key>;
        reverse(): Collection<T, Key>;
        mapToClass(constructor: Function): Function;
        add(item: T, key?: Key): Promise<Key>;
        update(key: Key, changes: { [keyPath: string]: any }): Promise<number>;
        put(item: T, key?: Key): Promise<Key>;
        delete(key: Key): Promise<void>;
        clear(): Promise<void>;
        bulkAdd(items: T[], keys?: IndexableTypeArrayReadonly): Promise<Key>;
        bulkPut(items: T[], keys?: IndexableTypeArrayReadonly): Promise<Key>;
        bulkDelete(keys: IndexableTypeArrayReadonly) : Promise<void>;
    }

    interface WhereClause<T, Key> {
        above(key: IndexableType): Collection<T, Key>;
        aboveOrEqual(key: IndexableType): Collection<T, Key>;
        anyOf(keys: IndexableTypeArrayReadonly): Collection<T, Key>;
        anyOf(...keys: IndexableTypeArrayReadonly): Collection<T, Key>;
        anyOfIgnoreCase(keys: string[]): Collection<T, Key>;
        anyOfIgnoreCase(...keys: string[]): Collection<T, Key>;
        below(key: IndexableType): Collection<T, Key>;
        belowOrEqual(key: IndexableType): Collection<T, Key>;
        between(lower: IndexableType, upper: IndexableType, includeLower?: boolean, includeUpper?: boolean): Collection<T, Key>;
        equals(key: IndexableType): Collection<T, Key>;
        equalsIgnoreCase(key: string): Collection<T, Key>;
        inAnyRange(ranges: Array<IndexableTypeArrayReadonly>): Collection<T, Key>;
        startsWith(key: string): Collection<T, Key>;
        startsWithAnyOf(prefixes: string[]): Collection<T, Key>;
        startsWithAnyOf(...prefixes: string[]): Collection<T, Key>;
        startsWithIgnoreCase(key: string): Collection<T, Key>;
        startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, Key>;
        startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, Key>;
        noneOf(keys: Array<IndexableType>): Collection<T, Key>;
        notEqual(key: IndexableType): Collection<T, Key>;
    }

    interface Collection<T, Key> {
        and(filter: (x: T) => boolean): Collection<T, Key>;
        clone(props?: Object): Collection<T, Key>;
        count(): Promise<number>;
        count<U>(onFulfilled: (value: number) => Thenable<U>): Promise<U>;
        count<U>(onFulfilled: (value: number) => U): Promise<U>;
        distinct(): Collection<T, Key>;
        each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachPrimaryKey(callback: (key: Key, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        filter(filter: (x: T) => boolean): Collection<T, Key>;
        first(): Promise<T | undefined>;
        first<U>(onFulfilled: (value: T | undefined) => Thenable<U>): Promise<U>;
        first<U>(onFulfilled: (value: T | undefined) => U): Promise<U>;
        keys(): Promise<IndexableTypeArray>;
        keys<U>(onFulfilled: (value: IndexableTypeArray) => Thenable<U>): Promise<U>;
        keys<U>(onFulfilled: (value: IndexableTypeArray) => U): Promise<U>;
        primaryKeys(): Promise<Key[]>;
        primaryKeys<U>(onFulfilled: (value: Key[]) => Thenable<U>): Promise<U>;
        primaryKeys<U>(onFulfilled: (value: Key[]) => U): Promise<U>;
        last(): Promise<T | undefined>;
        last<U>(onFulfilled: (value: T | undefined) => Thenable<U>): Promise<U>;
        last<U>(onFulfilled: (value: T | undefined) => U): Promise<U>;
        limit(n: number): Collection<T, Key>;
        offset(n: number): Collection<T, Key>;
        or(indexOrPrimayKey: string): WhereClause<T, Key>;
        raw(): Collection<T, Key>;
        reverse(): Collection<T, Key>;
        sortBy(keyPath: string): Promise<T[]>;
        sortBy<U>(keyPath: string, onFulfilled: (value: T[]) => Thenable<U>): Promise<U>;
        sortBy<U>(keyPath: string, onFulfilled: (value: T[]) => U): Promise<U>;
        toArray(): Promise<Array<T>>;
        toArray<U>(onFulfilled: (value: Array<T>) => Thenable<U>): Promise<U>;
        toArray<U>(onFulfilled: (value: Array<T>) => U): Promise<U>;
        uniqueKeys(): Promise<IndexableTypeArray>;
        uniqueKeys<U>(onFulfilled: (value: IndexableTypeArray) => Thenable<U>): Promise<U>;
        uniqueKeys<U>(onFulfilled: (value: IndexableTypeArray) => U): Promise<U>;
        until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, Key>;
        // WriteableCollection:
        delete(): Promise<number>;
        modify(changeCallback: (obj: T, ctx:{value: T}) => void): Promise<number>;
        modify(changes: { [keyPath: string]: any } ): Promise<number>;
    }

    interface TableSchema {
        name: string;
        primKey: IndexSpec;
        indexes: IndexSpec[];
        mappedClass: Function;
    }

    interface IndexSpec {
        name: string;
        keyPath: string | Array<string>;
        unique: boolean;
        multi: boolean;
        auto: boolean;
        compound: boolean;
        src: string;
    }
    
    // Make it possible to touch physical classes as they are 
    var TableSchema: new()=>TableSchema,
        IndexSpec: new()=>IndexSpec,
        Events: any; // Too complex to define correctly right now.
    
    // errnames - handy spellcheck in switch (error.name) {} cases.        
    var errnames: {
        // Error names generated by indexedDB:
        Unknown: 'UnknownError';
        Constraint: 'ConstraintError';
        Data: 'DataError';
        TransactionInactive: 'TransactionInactiveError';
        ReadOnly: 'ReadOnlyError';
        Version: 'VersionError';
        NotFound: 'NotFoundError';
        InvalidState: 'InvalidStateError';
        InvalidAccess: 'InvalidAccessError';
        Abort: 'AbortError';
        Timeout: 'TimeoutError';
        QuotaExceeded: 'QuotaExceededError';
        Syntax: 'SyntaxError';
        DataClone: 'DataCloneError';
        
        // Dexie-specific error names:
        Modify: 'ModifyError';
        OpenFailed: 'OpenFailedError';
        VersionChange: 'VersionChangeError';
        Schema: 'SchemaError';
        Upgrade: 'UpgradeError';
        InvalidTable: 'InvalidTableError';
        MissingAPI: 'MissingAPIError';
        NoSuchDatabase: 'NoSuchDatabaseError';
        InvalidArgument: 'InvalidArgumentError';
        SubTransaction: 'Error';
        Unsupported: 'UnsupportedError';
        Internal: 'InternalError';
        DatabaseClosed: 'DatabaseClosedError';
    };
    
    class DexieError extends Error {
        name: string;
        message: string;
        stack: string;
        inner: any;

        constructor (name?:string, message?:string);
        toString(): string;
    }
    
    class ModifyError extends DexieError{
        constructor (msg?:string, failures?: any[], successCount?: number, failedKeys?: IndexableTypeArrayReadonly);
        failures: Array<any>;
        failedKeys: IndexableTypeArrayReadonly;
        successCount: number;
    }
    
    class BulkError extends DexieError{
        constructor (msg?:string, failures?: any[]);
        failures: Array<any>;
    }
    
    class OpenFailedError extends DexieError {constructor (msg?: string, inner?: Object);constructor (inner: Object);}
    class VersionChangeError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class SchemaError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class UpgradeError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidTableError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class MissingAPIError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class NoSuchDatabaseError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidArgumentError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class SubTransactionError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class UnsupportedError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InternalError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class DatabaseClosedError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class UnknownError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class ConstraintError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class DataError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class TransactionInactiveError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class ReadOnlyError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class VersionError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class NotFoundError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidStateError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidAccessError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class AbortError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class TimeoutError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class QuotaExceededError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class SyntaxError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class DataCloneError extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
}

export default Dexie;
