export declare const hasBigIntSupport: boolean;
export declare class FakeBigInt {
    v: string;
    static compare(a: bigint | FakeBigInt, b: bigint | FakeBigInt): 1 | 0 | -1;
    toString(): string;
    constructor(value: string);
}
export declare const TSON: {
    stringify(value: any, alternateChannel?: any, space?: number | undefined): string;
    parse(tson: string, alternateChannel?: any): any;
};
export declare const BISON: {
    toBinary(value: any): Blob;
    stringify(value: any): [Blob, string];
    parse<T = any>(json: string, binData: Blob): Promise<T>;
    fromBinary<T_1 = any>(blob: Blob): Promise<T_1>;
};
