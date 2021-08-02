export interface CancelToken {
    cancelled: boolean;
}
export declare function throwIfCancelled(cancelToken?: CancelToken): void;
