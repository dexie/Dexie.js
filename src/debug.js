// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
export var debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

export function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}

export var libraryFilter = ()=>true;

export const NEEDS_THROW_FOR_STACK = !new Error("").stack;

export function prettyStack(exception, numIgnoredLines) {
    var stack = exception.stack;
    if (!stack) return "";
    return stack.split('\n')
        .slice(numIgnoredLines || 0)
        .filter(libraryFilter)
        .map(frame => "\n" + frame)
        .join('');
}
