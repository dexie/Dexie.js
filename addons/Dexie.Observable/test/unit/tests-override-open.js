import {module, test, strictEqual, deepEqual, ok} from 'QUnit';
import initOverrideOpen from '../../src/override-open';

module('override-open', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should call the given original function', () => {
  let wasCalled = false;
  function origFn() {
    wasCalled = true;
  }

  const db = {
    _allTables: {}
  };

  initOverrideOpen(db, function SyncNode() {}, function crudMonitor() {})(origFn)();
  ok(wasCalled);
});

test('should call the crudMonitor function for every observable table', () => {
  const tables = [];
  function crudMonitor(table) {
    tables.push(table);
  }

  const db = {
    _allTables: {
      foo: {
        // TableSchema: for more info see https://github.com/dfahlander/Dexie.js/wiki/TableSchema
        schema: {
          observable: true
        }
      },
      _bar: {
        schema: {}
      }
    }
  };

  initOverrideOpen(db, function SyncNode() {}, crudMonitor)(() => {})();
  deepEqual(tables, [db._allTables.foo]);
});

test('should call mapToClass for the _syncNodes table', () => {
  function SyncNode() {}
  let calledWithClass;
  const db = {
    _allTables: {
      _syncNodes: {
        name: '_syncNodes',
        mapToClass(cls) {
          calledWithClass = cls;
        },
        schema: {}
      }
    }
  };

  initOverrideOpen(db, SyncNode, function crudMonitor(){})(() => {})();
  strictEqual(calledWithClass, SyncNode);
});
