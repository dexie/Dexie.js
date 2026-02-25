import Dexie from 'dexie';
import { module, stop, start, asyncTest, ok, equal } from 'QUnit';
import { spawnedTest } from './dexie-unittest-utils';
import { isModernChromeInternal } from '../src/functions/quirks';

module("connections", {
    setup: function () {
        stop();
        Dexie.delete("TestDB").then(start);
    },
    teardown: function () {
        stop();
        Dexie.delete("TestDB").then(start);
    }
});

spawnedTest("Dexie connection tracking should respect _trackConnection", function* () {
    const isChrome115 = typeof navigator !== 'undefined' && 
        (() => {
            const m = navigator.userAgent.match(/Chrome\/(\d+)/);
            return m && parseInt(m[1]) >= 115;
        })();

    const db = new Dexie("TestDB");
    db.version(1).stores({foo: 'id'});
    
    if (isChrome115) {
        ok(!db._trackConnection, "In Chrome 115+, _trackConnection should be false by default");
        const initialConnections = Dexie.connections.length;
        yield db.open();
        equal(Dexie.connections.length, initialConnections, "Connection should NOT be added to Dexie.connections in Chrome 115+");
    } else {
        ok(db._trackConnection, "In other browsers, _trackConnection should be true by default");
        const initialConnections = Dexie.connections.length;
        yield db.open();
        equal(Dexie.connections.length, initialConnections + 1, "Connection SHOULD be added to Dexie.connections in other browsers");
        db.close();
        equal(Dexie.connections.length, initialConnections, "Connection should be removed from Dexie.connections after close");
    }
});

spawnedTest("isModernChromeInternal should correctly detect Chrome >= 115", function* () {
    const isModern = isModernChromeInternal;
    
    ok(isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"), "Chrome 115 detected as modern");
    ok(isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"), "Chrome 116 detected as modern");
    ok(isModern("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"), "Chrome 120 detected as modern");
    ok(isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"), "Edge 120 (Chromium based) detected as modern Chrome");
    
    ok(!isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"), "Chrome 114 NOT detected as modern");
    ok(!isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"), "Chrome 100 NOT detected as modern");
    ok(!isModern("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15"), "Safari NOT detected as modern Chrome");
    ok(!isModern("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"), "Firefox 115 NOT detected as modern Chrome");
});
