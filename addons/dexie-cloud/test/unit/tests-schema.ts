import { deepEqual, module, strictEqual, test } from 'qunit';
import {
  applyServerSchema,
  mergePersistedSchema,
} from '../../src/mergePersistedSchema';

module('schema');

test('tables absent from persisted schema are marked for initial sync', () => {
  const declaredSchema = {
    friends: { markedForSync: true, generatedGlobalId: true },
    pets: { markedForSync: true, generatedGlobalId: true },
  };
  const persistedSchema = {
    friends: {
      markedForSync: true,
      generatedGlobalId: true,
      initiallySynced: true,
      idPrefix: 'fr',
    },
  };

  const mergedSchema = mergePersistedSchema(declaredSchema, persistedSchema);

  strictEqual(
    mergedSchema.friends.initiallySynced,
    true,
    'an existing table keeps its completed initial-sync state'
  );
  strictEqual(
    mergedSchema.pets.initiallySynced,
    false,
    'a table absent from persisted schema requires a full load'
  );
  strictEqual(
    mergedSchema.friends.idPrefix,
    'fr',
    'persisted table metadata is preserved'
  );
});

test('dynamic clients can continue using the persisted schema unchanged', () => {
  const persistedSchema = {
    friends: {
      markedForSync: true,
      initiallySynced: true,
      idPrefix: 'fr',
    },
  };

  deepEqual(
    mergePersistedSchema({}, persistedSchema),
    persistedSchema,
    'no declared tables means no new initial-sync markers'
  );
});

test('an old server cannot clear a pending table initial sync', () => {
  const schema = {
    friends: { markedForSync: true, initiallySynced: true },
    pets: { markedForSync: true, initiallySynced: false },
  };

  applyServerSchema(schema, {
    friends: { markedForSync: true },
    pets: { markedForSync: true },
  });

  strictEqual(
    schema.friends.initiallySynced,
    true,
    'an already synced table remains synced'
  );
  strictEqual(
    schema.pets.initiallySynced,
    false,
    'false remains until the server explicitly acknowledges the full load'
  );
});

test('a new server can acknowledge a completed table initial sync', () => {
  const schema = {
    pets: { markedForSync: true, initiallySynced: false },
  };

  applyServerSchema(schema, {
    pets: { markedForSync: true, initiallySynced: true },
  });

  strictEqual(
    schema.pets.initiallySynced,
    true,
    'an explicit acknowledgement clears the pending marker'
  );
});
