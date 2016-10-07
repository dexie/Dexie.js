import Promise from './Promise';
import {exceptions} from './errors';

export function rejection (err, uncaughtHandler) {
    // Get the call stack and return a rejected promise.
    var rv = Promise.reject(err);
    return uncaughtHandler ? rv.uncaught(uncaughtHandler) : rv;
}

export function idbp(idbOperation) {
    return new Promise((resolve,reject) => {
        var req = idbOperation();
        req.onerror = reject;
        req.onsuccess = resolve;
    });
}

export function assert(b) {
    if (!b) throw new exceptions.Internal("Assertion failed");
}
