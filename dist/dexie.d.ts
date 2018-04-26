// Type definitions for Dexie v2.0.3
// Project: https://github.com/dfahlander/Dexie.js
// Definitions by: David Fahlander <http://github.com/dfahlander>

declare type IndexableTypePart =
    string | number | Date | ArrayBuffer | ArrayBufferView | DataView | Array<Array<void>>;

declare type IndexableTypeArray = Array<IndexableTypePart>;
declare type IndexableTypeArrayReadonly = ReadonlyArray<IndexableTypePart>;
export declare type IndexableType = IndexableTypePart | IndexableTypeArrayReadonly;

declare type ThenShortcut<T,TResult> =  (value: T) => TResult | PromiseLike<TResult>;

declare type TransactionMode = 'r' | 'r!' | 'r?' | 'rw' | 'rw!' | 'rw?';

interface ProbablyError {
    name?: string;
    stack?: string;
    message?: string;
}

// Dexie is actually default exported at the end of this file.
// Still, need to keep this explicit export anyway. Needed in order for
// Typescript 2.1 to allow extension of the Dexie API.
export declare class Dexie {
    constructor(databaseName: string, options?: {
        addons?: Array<(db: Dexie) => void>,
        autoOpen?: boolean,
        indexedDB?: IDBFactory,
        IDBKeyRange?: {new(): IDBKeyRange}
    });

    readonly name: string;
    readonly tables: Dexie.Table<any, any>[];
    readonly verno: number;

    static addons: Array<(db: Dexie) => void>;
    static version: number;
    static semVer: string;
    static currentTransaction: Dexie.Transaction;
    static waitFor<T> (promise: PromiseLike<T> | T) : Dexie.Promise<T>;
    static waitFor<T> (promise: PromiseLike<T> | T, timeoutMilliseconds: number) : Dexie.Promise<T>;

    static getDatabaseNames(): Dexie.Promise<string[]>;
    static getDatabaseNames<R>(thenShortcut: ThenShortcut<string[],R>): Dexie.Promise<R>;

    static override<F> (origFunc:F, overridedFactory: (fn:any)=>any) : F;
    
    static getByKeyPath(obj: Object, keyPath: string): any;

    static setByKeyPath(obj: Object, keyPath: string, value: any): void;

    static delByKeyPath(obj: Object, keyPath: string): void;

    static shallowClone<T> (obj: T): T;

    static deepClone<T>(obj: T): T;
    
    static asap(fn: Function) : void;
    
    static maxKey: Array<Array<void>> | string;
    static minKey: number;

    static exists(dbName: string) : Dexie.Promise<boolean>;

    static delete(dbName: string): Dexie.Promise<void>;
    
    static dependencies: {
        indexedDB: IDBFactory,
        IDBKeyRange: IDBKeyRange
    };
        
    static default: Dexie;
    
    version(versionNumber: Number): Dexie.Version;

    on: Dexie.DbEvents;

    open(): Dexie.Promise<Dexie>;

    table(tableName: string): Dexie.Table<any, any>;

    table<T>(tableName: string): Dexie.Table<T, any>;

    table<T, Key>(tableName: string): Dexie.Table<T, Key>;

    transaction<U>(mode: TransactionMode, table: Dexie.Table<any, any>, scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    transaction<U>(mode: TransactionMode, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    transaction<U>(mode: TransactionMode, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, table3: Dexie.Table<any, any>, scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    transaction<U>(mode: TransactionMode, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, table3: Dexie.Table<any, any>, table4: Dexie.Table<any,any>, scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    transaction<U>(mode: TransactionMode, table: Dexie.Table<any, any>, table2: Dexie.Table<any, any>, table3: Dexie.Table<any, any>, table4: Dexie.Table<any,any>, table5: Dexie.Table<any,any>, scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    transaction<U>(mode: TransactionMode, tables: Dexie.Table<any, any>[], scope: () => PromiseLike<U> | U): Dexie.Promise<U>;

    close(): void;

    delete(): Dexie.Promise<void>;

    isOpen(): boolean;

    hasBeenClosed(): boolean;

    hasFailed(): boolean;

    dynamicallyOpened(): boolean;

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

export declare module Dexie {

    interface Promise<T> {
        // From Promise<T> in lib.es2015.d.ts and lib.es2015.symbol.wellknown.d.ts but with return type Dexie.Promise<T>:
        then(onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => T | PromiseLike<T>) | undefined | null): Dexie.Promise<T>;
        then<TResult>(onfulfilled: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected: (reason: any) => TResult | PromiseLike<TResult>): Dexie.Promise<T | TResult>;
        then<TResult>(onfulfilled: (value: T) => TResult | PromiseLike<TResult>, onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Dexie.Promise<TResult>;
        then<TResult1, TResult2>(onfulfilled: (value: T) => TResult1 | PromiseLike<TResult1>, onrejected: (reason: any) => TResult2 | PromiseLike<TResult2>): Dexie.Promise<TResult1 | TResult2>;
        catch(onrejected?: ((reason: any) => T | PromiseLike<T>) | undefined | null): Dexie.Promise<T>;
        catch<TResult>(onrejected: (reason: any) => TResult | PromiseLike<TResult>): Dexie.Promise<T | TResult>;
        readonly [Symbol.toStringTag]: "Promise";
        
        // Extended methods provided by Dexie.Promise:

        /**
         * Catch errors where error => error.name === errorName. Other errors will remain uncaught.
         * 
         * @param errorName Name of the type of error to catch such as 'RangeError', 'TypeError', 'DatabaseClosedError', etc.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult>(errorName: string, onrejected: (reason: Error) => TResult | PromiseLike<TResult>): Dexie.Promise<T | TResult>;

        /**
         * Catch errors where error => error.name === errorName. Other errors will remain uncaught.
         * 
         * @param errorName Name of the type of error to catch such as 'RangeError', 'TypeError', 'DatabaseClosedError', etc.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch(errorName: string, onrejected: (reason: Error) => T | PromiseLike<T>): Dexie.Promise<T>;

        /**
         * Catch errors where error => error instanceof errorConstructor. Other errors will remain uncaught.
         * 
         * @param errorConstructor Type of error to catch such as RangeError, TypeError, etc.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult,TError>(errorConstructor: {new():TError}, onrejected: (reason: TError) => TResult | PromiseLike<TResult>): Dexie.Promise<T | TResult>;

        /**
         * Catch errors where error => error instanceof errorConstructor. Other errors will remain uncaught.
         * 
         * @param errorConstructor Type of error to catch such as RangeError, TypeError, etc.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TError>(errorConstructor: {new():TError}, onrejected: (reason: TError) => T | PromiseLike<T>): Dexie.Promise<T>;

        /**
         * Attaches a callback to be executed when promise is settled no matter if it was rejected
         * or resolved.
         * 
         * @param onFinally The callback to execute when promise is settled.
         * @returns A Promise for the completion of the callback.
         */
        finally(onFinally: () => void): Dexie.Promise<T>;

        /**
         * Apply a timeout limit for the promise. If timeout is reached before promise is settled,
         * the returned promise will reject with an Error object where name='TimeoutError'.
         * 
         * @param milliseconds Number of milliseconds for the timeout.
         * @returns A Promise that will resolve or reject identically to current Promise, but if timeout is reached,
         *          it will reject with TimeoutError.
         */
        timeout(milliseconds: number): Dexie.Promise<T>;    
    }

    interface DexiePromiseConstructor {
        // From lib.es6.d.ts:
        all<TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Dexie.Promise<TAll[]>;
        race<T>(values: Iterable<T | PromiseLike<T>>): Dexie.Promise<T>;
        readonly prototype: Dexie.Promise<any>;
        new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Dexie.Promise<T>;
        all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Dexie.Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
        all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Dexie.Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
        all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Dexie.Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
        all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Dexie.Promise<[T1, T2, T3, T4, T5, T6, T7]>;
        all<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Dexie.Promise<[T1, T2, T3, T4, T5, T6]>;
        all<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>]): Dexie.Promise<[T1, T2, T3, T4, T5]>;
        all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>]): Dexie.Promise<[T1, T2, T3, T4]>;
        all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Dexie.Promise<[T1, T2, T3]>;
        all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Dexie.Promise<[T1, T2]>;
        all<T>(values: (T | PromiseLike<T>)[]): Dexie.Promise<T[]>;
        reject(reason: any): Dexie.Promise<never>;
        reject<T>(reason: any): Dexie.Promise<T>;
        resolve<T>(value: T | PromiseLike<T>): Dexie.Promise<T>;
        resolve(): Dexie.Promise<void>;
    }
    

    var Promise: DexiePromiseConstructor;

    interface Version {
        stores(schema: { [key: string]: string | null }): Version;
        upgrade(fn: (trans: Transaction) => void): Version;
    }

    interface Transaction {
        active: boolean;
        db: Dexie;
        mode: string;
        idbtrans: IDBTransaction;
        tables: { [type: string]: Table<any, any> };
        storeNames: Array<string>;
        on: TransactionEvents;
        abort(): void;
        table(tableName: string): Table<any, any>;
        table<T>(tableName: string): Table<T, any>;
        table<T, Key>(tableName: string): Table<T, Key>;
    }

    interface DexieEvent {
        subscribers: Function[];
        fire(...args:any[]): any;
        subscribe(fn: (...args:any[]) => any): void;
        unsubscribe(fn: (...args:any[]) => any): void;
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

    interface DexieEventSet {
        (eventName: string): DexieEvent; // To be able to unsubscribe.

        addEventType (
            eventName: string,
            chainFunction?: (f1:Function,f2:Function)=>Function,
            defaultFunction?: Function):Dexie.DexieEvent;
        addEventType (
            events: {[eventName:string]: ('asap' | [(f1:Function,f2:Function)=>Function, Function])})
            : Dexie.DexieEvent;    
    }

    interface DbEvents extends DexieEventSet {
        (eventName: 'ready', subscriber: () => any, bSticky?: boolean): void;
        (eventName: 'populate', subscriber: () => any): void;
        (eventName: 'blocked', subscriber: () => any): void;
        (eventName: 'versionchange', subscriber: (event: IDBVersionChangeEvent) => any): void;
        ready: Dexie.DexieOnReadyEvent;
        populate: Dexie.DexieEvent;
        blocked: Dexie.DexieEvent;
        versionchange: Dexie.DexieVersionChangeEvent;        
    }

    interface CreatingHookContext<T,Key> {
        onsuccess?: (primKey: Key) => void;
        onerror?: (err: any) => void;
    }

    interface UpdatingHookContext<T,Key> {
        onsuccess?: (updatedObj: T) => void;
        onerror?: (err: any) => void;
    }

    interface DeletingHookContext<T,Key> {
        onsuccess?: () => void;
        onerror?: (err: any) => void;
    }

    interface TableHooks<T,Key> extends DexieEventSet {
        (eventName: 'creating', subscriber: (this: CreatingHookContext<T,Key>, primKey:Key, obj:T, transaction:Transaction) => any): void;
        (eventName: 'reading', subscriber: (obj:T) => T | any): void;
        (eventName: 'updating', subscriber: (this: UpdatingHookContext<T,Key>, modifications:Object, primKey:Key, obj:T, transaction:Transaction) => any): void;
        (eventName: 'deleting', subscriber: (this: DeletingHookContext<T,Key>, primKey:Key, obj:T, transaction:Transaction) => any): void;
        creating: DexieEvent;
        reading: DexieEvent;
        updating: DexieEvent;
        deleting: DexieEvent;
    }

    interface TransactionEvents extends DexieEventSet {
        (eventName: 'complete', subscriber: () => any): void;
        (eventName: 'abort', subscriber: () => any): void;
        (eventName: 'error', subscriber: (error:any) => any): void;
        complete: DexieEvent;
        abort: DexieEvent;
        error: DexieEvent;
    }    

    interface Table<T, Key> {
        name: string;
        schema: TableSchema;
        hook: TableHooks<T, Key>;

        get(key: Key): Promise<T | undefined>;
        get<R>(key: Key, thenShortcut: ThenShortcut<T | undefined,R>): Promise<R>;
        get(equalityCriterias: {[key:string]:IndexableType}): Promise<T | undefined>;
        get<R>(equalityCriterias: {[key:string]:IndexableType}, thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
        where(index: string | string[]): WhereClause<T, Key>;
        where(equalityCriterias: {[key:string]:IndexableType}): Collection<T, Key>;

        filter(fn: (obj: T) => boolean): Collection<T, Key>;

        count(): Promise<number>;
        count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;

        offset(n: number): Collection<T, Key>;

        limit(n: number): Collection<T, Key>;

        each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;

        toArray(): Promise<Array<T>>;
        toArray<R>(thenShortcut: ThenShortcut<T[], R>): Promise<R>;

        toCollection(): Collection<T, Key>;
        orderBy(index: string | string[]): Collection<T, Key>;
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
        anyOf(...keys: IndexableTypeArray): Collection<T, Key>;
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
        count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;
        distinct(): Collection<T, Key>;
        each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachPrimaryKey(callback: (key: Key, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
        filter(filter: (x: T) => boolean): Collection<T, Key>;
        first(): Promise<T | undefined>;
        first<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
        keys(): Promise<IndexableTypeArray>;
        keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
        primaryKeys(): Promise<Key[]>;
        primaryKeys<R>(thenShortcut: ThenShortcut<Key[], R>): Promise<R>;
        last(): Promise<T | undefined>;
        last<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
        limit(n: number): Collection<T, Key>;
        offset(n: number): Collection<T, Key>;
        or(indexOrPrimayKey: string): WhereClause<T, Key>;
        raw(): Collection<T, Key>;
        reverse(): Collection<T, Key>;
        sortBy(keyPath: string): Promise<T[]>;
        sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
        toArray(): Promise<Array<T>>;
        toArray<R>(thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
        uniqueKeys(): Promise<IndexableTypeArray>;
        uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
        until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, Key>;
        // Mutating methods
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
