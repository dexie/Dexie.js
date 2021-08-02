import { Observable } from "rxjs";
import { SWBroadcastChannel } from "./SWBroadcastChannel";
export declare class BroadcastedAndLocalEvent<T> extends Observable<T> {
    name: string;
    bc: BroadcastChannel | SWBroadcastChannel;
    constructor(name: string);
    next(message: T): void;
}
