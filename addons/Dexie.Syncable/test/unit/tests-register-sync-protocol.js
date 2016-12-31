import Dexie from 'dexie';
import '../../src/Dexie.Syncable';
import {module, test, strictEqual, raises} from 'QUnit';

module('registerSyncProtocol', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should set partialsThreshold to Infinity if no threshold was given', () => {
  const protocolName = 'foo';
  Dexie.Syncable.registerSyncProtocol(protocolName, {
    sync() {},
  });

  strictEqual(Dexie.Syncable.registeredProtocols[protocolName].partialsThreshold, Infinity);
});

test('should save the given partialsThreshold', () => {
  const protocolName = 'foo';
  Dexie.Syncable.registerSyncProtocol(protocolName, {
    sync() {},
    partialsThreshold: 1000
  });

  strictEqual(Dexie.Syncable.registeredProtocols[protocolName].partialsThreshold, 1000);
});

test('should throw an error if the partialsThreshold is NaN or smaller 0', () => {
  const protocolName = 'foo';

  function fn1() {
    Dexie.Syncable.registerSyncProtocol(protocolName, {
      sync() {},
      partialsThreshold: NaN
    });
  }

  raises(fn1, Error, 'NaN test');

  function fn2() {
    Dexie.Syncable.registerSyncProtocol(protocolName, {
      sync() {},
      partialsThreshold: -10
    });
  }

  raises(fn2, Error, 'Negative number test');
});
