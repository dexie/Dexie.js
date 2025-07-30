import { nop } from "./nop";

export function nonStoppableEventChain(f1: Function, f2: Function) {
    if (f1 === nop) return f2;
    return function () {
        f1.apply(this, arguments);
        f2.apply(this, arguments);
    };
}
