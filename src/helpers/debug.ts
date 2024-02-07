// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
export var debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

export function setDebug(value, filter) {
    debug = value;
}

export function deprecated<T> (what: string, fn: (...args)=>T) {
    return function () {
        console.warn(`${what} is deprecated. See https://dexie.org/docs/Deprecations}`);
        return fn.apply(this, arguments);
    } as (...args)=>T
}
