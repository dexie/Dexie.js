export interface JsonStream<T> {
    pullAsync(numBytes: number): Promise<Partial<T>>;
    pullSync(numBytes: number): Partial<T>;
    done(): boolean;
    eof(): boolean;
    result: Partial<T>;
}
export declare function JsonStream<T>(blob: Blob): JsonStream<T>;
export declare function JsonParser(allowPartial: boolean): {
    write(jsonPart: string): any;
    done(): boolean;
};
