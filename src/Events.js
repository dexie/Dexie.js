import {slice, keys, isArray, asap, _global} from './utils';
import {nop, stoppableEventChain} from './chaining-functions';
import {exceptions} from './errors';

export default function Events(ctx) {
    var args = arguments;
    var evs = {};
    var rv = function (eventName, subscriber) {
        if (subscriber) {
            // Subscribe
            var args = slice(arguments, 1);
            var ev = evs[eventName];
            ev.subscribe.apply(ev, args);
            return ctx;
        } else if (typeof (eventName) === 'string') {
            // Return interface allowing to fire or unsubscribe from event
            return evs[eventName];
        }
    };
    rv.addEventType = add;

    function add(eventName, chainFunction, defaultFunction) {
        if (isArray(eventName)) return addEventGroup(eventName);
        if (typeof eventName === 'object') return addConfiguredEvents(eventName);
        if (!chainFunction) chainFunction = stoppableEventChain;
        if (!defaultFunction) defaultFunction = nop;

        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function (cb) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
            },
            unsubscribe: function (cb) {
                context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }

    function addConfiguredEvents(cfg) {
        // events(this, {reading: [functionChain, nop]});
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === 'asap') {
                // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                var context = add(eventName, null, function fire() {
                    var args = arguments;
                    context.subscribers.forEach(function (fn) {
                        asap(function fireEvent() {
                            fn.apply(_global, args);
                        });
                    });
                });
                context.subscribe = function (fn) {
                    // Change how subscribe works to not replace the fire function but to just add the subscriber to subscribers
                    if (context.subscribers.indexOf(fn) === -1)
                        context.subscribers.push(fn);
                };
                context.unsubscribe = function (fn) {
                    // Change how unsubscribe works for the same reason as above.
                    var idxOfFn = context.subscribers.indexOf(fn);
                    if (idxOfFn !== -1) context.subscribers.splice(idxOfFn, 1);
                };
            } else throw new exceptions.InvalidArgument("Invalid event config");
        });
    }

    function addEventGroup(eventGroup) {
        // promise-based event group (i.e. we promise to call one and only one of the events in the pair, and to only call it once.
        var done = false;
        eventGroup.forEach(function (name) {
            add(name).subscribe(checkDone);
        });
        function checkDone() {
            if (done) return false;
            done = true;
        }
    }

    for (var i = 1, l = args.length; i < l; ++i) {
        add(args[i]);
    }

    return rv;
}
