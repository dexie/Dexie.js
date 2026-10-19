// Regression guard for issue #2330 (minified bundle corrupts updating-hook chain).
//
// The minified production bundle (dist/dexie.min.js, built with uglify-js)
// reuses the `modifications` parameter name of hookUpdatingChain's inner
// function for a local variable. The bundle has no "use strict", so in sloppy
// mode the parameter aliases arguments[0]; assigning this.onsuccess to that
// reused local overwrites arguments[0] with null just before it is forwarded
// to the next subscriber (see the reproduced minified output in the issue).
// Every updating-hook subscriber after the first then receives null.
//
// The dev bundles are strict mode and unaffected, which is why karma (loading
// dist/dexie.js) could never catch this class of bug. The guard here is
// therefore structural: the closure composed by hookUpdatingChain must not
// declare any parameters, the same shape as hookCreatingChain which has
// always been safe under the same minifier. If a named parameter is
// re-introduced, this test fails and forces a minified-bundle verification
// before the change can ship (repro: subscribe 3 updating hooks against
// dist/dexie.min.js built with `uglifyjs dexie.js -m -c negate_iife=0`).

import Dexie from 'dexie';
import { module, stop, start, asyncTest, ok } from 'QUnit';
import { resetDatabase } from './dexie-unittest-utils';

var db = new Dexie('TestIssue2330DB');
db.version(1).stores({ friends: '++id, name' });

module('updating hook chain', {
  setup: () => {
    stop();
    resetDatabase(db)
      .catch((e) => {
        ok(false, 'Error resetting database: ' + e.stack);
      })
      .finally(start);
  },
  teardown: () => {},
});

asyncTest('chained updating hooks must receive the modifications', function () {
  var delivered1 = [];
  var delivered2 = [];
  function subscriber1(modifications) {
    delivered1.push(modifications);
  }
  function subscriber2(modifications) {
    delivered2.push(modifications);
  }
  db.friends.hook('updating', subscriber1);
  db.friends.hook('updating', subscriber2);

  db.friends
    .add({ name: 'Ada', age: 36 })
    .then(function (id) {
      return db.friends.update(id, { age: 37 }).then(function () {
        // Runtime part: both subscribers saw the modifications object.
        ok(
          delivered1.length === 1 && delivered2.length === 1,
          'both subscribers were called'
        );
        ok(
          delivered1[0] && delivered1[0].age === 37,
          'first updating subscriber received the modifications object'
        );
        ok(
          delivered2[0] && delivered2[0].age === 37,
          'second updating subscriber received the modifications object (not null)'
        );

        // Structural part: the composed chain closure must declare no
        // parameters, or uglify-js param reuse + sloppy-mode arguments
        // aliasing corrupts arguments[0] in dist/dexie.min.js (#2330).
        var fnSrc = String(db.friends.hook('updating').fire);
        var params = fnSrc.slice(fnSrc.indexOf('(') + 1, fnSrc.indexOf(')'));
        ok(
          /^\s*$/.test(params),
          'hookUpdatingChain closure must not declare parameters (got: "' +
            params +
            '"); a named parameter breaks the minified bundle, see issue #2330'
        );
        db.close();
        start();
      });
    })
    .catch(function (e) {
      ok(false, 'Error: ' + e.stack);
      start();
    });
});
