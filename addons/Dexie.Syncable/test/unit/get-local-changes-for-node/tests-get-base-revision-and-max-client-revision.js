import {module, test, deepEqual, equal, ok} from 'QUnit';
import getBaseRevisionAndMaxClientRevision from '../../../src/get-local-changes-for-node/get-base-revision-and-max-client-revision';

module('getBaseRevisionAndMaxClientRevision', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('maxClientRevision should be Infinity and remoteBaseRevision null if we haven\'t gotten any server changes yet', () => {
  const syncNode = {
    remoteBaseRevisions: []
  };

  const res = getBaseRevisionAndMaxClientRevision(syncNode);
  deepEqual(res, { maxClientRevision: Infinity, remoteBaseRevision: null});
});

test('remoteBaseRevision should be null and maxClientRevision should match the first server change if the sync node\'s revision is not bigger that at least one remoteBaseRevisions', () => {
  const syncNode = {
    remoteBaseRevisions: [{ local: 2, remote: 1 }, { local: 3, remote: 1 }],
    myRevision: 1
  };

  const res = getBaseRevisionAndMaxClientRevision(syncNode);
  deepEqual(res, { maxClientRevision: 2, remoteBaseRevision: null});
});

test('remoteBaseRevision should have the value of "remote" for a remoteBaseRevision\'s "local" matching "myRevision"', () => {
  const syncNode = {
    remoteBaseRevisions: [{ local: 2, remote: 1 }, { local: 3, remote: 2 }],
    myRevision: 2
  };

  const res = getBaseRevisionAndMaxClientRevision(syncNode);
  equal(res.remoteBaseRevision, 1);
});

test('maxClientRevision should have the value of the next "local" for a remoteBaseRevision\'s "local" matching "myRevision"', () => {
  const syncNode = {
    remoteBaseRevisions: [{ local: 2, remote: 1 }, { local: 3, remote: 2 }],
    myRevision: 2
  };

  const res = getBaseRevisionAndMaxClientRevision(syncNode);
  equal(res.maxClientRevision, 3);
});

test('maxClientRevision should be Infinity if the last remoteBaseRevision\'s "local" matches "myRevision"', () => {
  const syncNode = {
    remoteBaseRevisions: [{ local: 2, remote: 1 }, { local: 3, remote: 2 }],
    myRevision: 3
  };

  const res = getBaseRevisionAndMaxClientRevision(syncNode);
  equal(res.maxClientRevision, Infinity);
});
