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

export function prettyStack(e) {
    var stack = e.stack;
    if (!stack) return "";
    //var frames = stack.split('\n');
    //if (frames.length && frames[0].indexOf(e.name) === 0)
    //if (stack.indexOf(e.name) === 0) stack = stack.substr(e.name.length);
    return stack.split('\n')
        //.filter(frame => !/^Error/.test(frame))
        .filter(frame => frame.indexOf(''+e.name) != 0) // First line: "Error: message\n"
        .filter(libraryFilter)
                //(!libraryFilter || prettyStack.filter(frame)))
                /*(debug === 'dexie' ||                   // If debug
                !/(dexie\.js|dexie\.min\.js)/.test(frame))) // Ignore frames from dexie lib - focus on application
        //.slice(0, 3)*/
        .map(frame => "\n" + frame)
        .join('');
}
