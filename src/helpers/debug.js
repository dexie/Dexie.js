// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
export var debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

export function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}

export var libraryFilter = () => true;

export const NEEDS_THROW_FOR_STACK = !new Error("").stack;

export function getErrorWithStack() {
    "use strict";
    if (NEEDS_THROW_FOR_STACK) try {
        // Doing something naughty in strict mode here to trigger a specific error
        // that can be explicitely ignored in debugger's exception settings.
        // If we'd just throw new Error() here, IE's debugger's exception settings
        // will just consider it as "exception thrown by javascript code" which is
        // something you wouldn't want it to ignore.
        getErrorWithStack.arguments;
        throw new Error(); // Fallback if above line don't throw.
    } catch(e) {
        return e;
    }
    return new Error();
}

export function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack) return "";
    numIgnoredFrames = (numIgnoredFrames || 0);
    if (stack.indexOf(exception.name) === 0)
        numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n')
        .slice(numIgnoredFrames)
        .filter(libraryFilter)
        .map(frame => "\n" + frame)
        .join('');
}

export function deprecated (what, fn) {
    return function () {
        console.warn(`${what} is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. ${prettyStack(getErrorWithStack(), 1)}`);
        return fn.apply(this, arguments);
    }
}
