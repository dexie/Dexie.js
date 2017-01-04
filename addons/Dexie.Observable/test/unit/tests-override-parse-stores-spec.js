import {module, test, strictEqual, deepEqual, ok} from 'QUnit';
import overrideParseStoresSpec from '../../src/override-parse-stores-spec';

module('override-parse-stores', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should create stores for Dexie.Observable and Dexie.Syncable', () => {
 function origFunc(stores/*, dbSchema*/) {
   ok(typeof stores._changes === 'string', 'Should have _changes store');
   ok(typeof stores._syncNodes === 'string', 'Should have _syncNodes store');
   ok(typeof stores._intercomm === 'string', 'Should have _intercomm store');
   ok(typeof stores._uncommittedChanges === 'string', 'Should have _uncommittedChanges store');
 }

  const stores = {};
  const dbSchema = {};
  overrideParseStoresSpec(origFunc)(stores, dbSchema);
});

test('should add UUID keys to the schema', () => {
 function origFunc(){}

 const stores = {
   foo: '$$id',
 };
 const dbSchema = {
   // TableSchema: for more info see https://github.com/dfahlander/Dexie.js/wiki/TableSchema
   foo: {
     name: 'foo',
     // IndexSpec: for more info see https://github.com/dfahlander/Dexie.js/wiki/IndexSpec
     primKey: {
       name: '$$id',
       keyPath: '$$id'
     }
   }
 };
 overrideParseStoresSpec(origFunc)(stores, dbSchema);

  strictEqual(dbSchema.foo.primKey.name, 'id', 'Should remove $$ from the name');
  strictEqual(dbSchema.foo.primKey.keyPath, 'id', 'Should remove $$ from keyPath');
  strictEqual(dbSchema.foo.primKey.uuid, true, 'uuid should be set to true');
});

test('should observe tables without _ and $', () => {
  function origFunc(){}

  const stores = {
    foo: 'id',
    _foo: 'id',
    $bar: 'id'
  };
  const dbSchema = {
    foo: {primKey: {name: 'id'}},
    _foo: {primKey: {name: 'id'}},
    $bar: {primKey: {name: 'id'}}
  };
  overrideParseStoresSpec(origFunc)(stores, dbSchema);

  strictEqual(dbSchema.foo.observable, true, 'foo should be observed');
  strictEqual(dbSchema._foo.observable, undefined, '_foo should not be observed');
  strictEqual(dbSchema.$bar.observable, undefined, '$bar should not be observed');
});
