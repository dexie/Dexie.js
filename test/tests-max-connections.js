import Dexie from 'dexie';
import { module, asyncTest, ok, equal } from 'QUnit';
import { spawnedTest } from './dexie-unittest-utils';

module('maxConnections', {
  setup: function () {
    // Close all connections left open by previous tests to ensure they don't affect the results of these tests.
    for (const connection of [...Dexie.connections]) {
      connection.close();
    }
    equal(Dexie.connections.length, 0, 'No connections initially');
  },
  teardown: function* () {
    yield Dexie.delete('TestDB');
  },
});

spawnedTest('Should limit the number of connections', function* () {
  const max = 3;
  const dbs = [];
  try {
    equal(dbs.length, 0, 'No connections initially');

    for (let i = 0; i < max; ++i) {
      const db = new Dexie('TestDB', { maxConnections: max });
      db.version(1).stores({ foo: 'id' });
      yield db.open();
      dbs.push(db);
    }

    equal(Dexie.connections.length, max, 'Should have reached max connections');

    const extraDb = new Dexie('TestDB', { maxConnections: max });
    extraDb.version(1).stores({ foo: 'id' });

    try {
      yield extraDb.open();
      equal(
        Dexie.connections.length,
        max,
        'Should not have exceeded max connections'
      );
    } catch (e) {
      equal(
        e.name,
        'MaxConnectionsReachedError',
        'Could throw MaxConnectionsReachedError: ' + e.message
      );
    } finally {
      yield extraDb.close();
    }

    // Close one and try again
    yield dbs[0].close();
    equal(Dexie.connections.length, max - 1, 'Should have one less connection');

    yield dbs[0].open();
    equal(
      Dexie.connections.length,
      max,
      'Should have reached max connections again'
    );
  } finally {
    yield Promise.all(dbs.map((db) => db.close()));
  }
});

spawnedTest('Open connections should be tracked', function* () {
  if (typeof FinalizationRegistry === 'undefined') {
    ok(true, 'FinalizationRegistry not supported in this environment');
    return;
  }

  const max = 20;
  const dbs = [];

  try {
    equal(Dexie.connections.length, 0, 'No tracked connections initially');

    for (let i = 0; i < 5; ++i) {
      const db = new Dexie('TestDB', { maxConnections: max });
      db.version(1).stores({ foo: 'id' });
      yield db.open();
      dbs.push(db);
    }

    equal(Dexie.connections.length, 5, 'Connections should be tracked');
  } finally {
    yield Promise.all(dbs.map((db) => db.close()));
  }

  equal(
    Dexie.connections.length,
    0,
    'Connections should not be tracked after explicit close'
  );
});
