
export interface Cursor {
    readonly direction: string;
    readonly key: any;
    readonly primaryKey: any;
    readonly value: any;
    continue(key?: any): void;
    continuePrimaryKey(key: any, primaryKey: any): void;
    advance(count: number): void;
}
