
var keys = keys = Object.keys;

export function extend(obj, extension) {
    if (typeof extension !== 'object') extension = extension(); // Allow to supply a function returning the extension. Useful for simplifying private scopes.
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}

export function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            Child.prototype.constructor = Child;
            return {
                extend: function (extension) {
                    extend(Child.prototype, typeof extension !== 'object' ? extension(Parent.prototype) : extension);
                }
            };
        }
    };
}

var _slice = [].slice;

export function slice(args, start, end) {
    return _slice.call(args, start, end);
}

export function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}
