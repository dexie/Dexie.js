import { module, ok, equal } from 'qunit';
import { Subject } from 'rxjs';
import Dexie from 'dexie';
import { promisedTest } from '../promisedTest';
import { LocalSyncWorker } from '../../src/sync/LocalSyncWorker';
import { sync } from '../../src/sync/sync';

module('local-sync-worker');

// Keep the real zero-delay timer so promise continuations run naturally, but
// capture the long retry timers without making the tests wait 20 seconds.
function captureRetryTimers() {
  const originalSet = window.setTimeout;
  const originalClear = window.clearTimeout;
  const timers = new Map<number, { callback: () => void; delay: number }>();
  let nextId = 1000000;
  (window as any).setTimeout = (callback: () => void, delay: number) => {
    if (delay < 20000) return originalSet(callback, delay);
    const id = nextId++;
    timers.set(id, { callback, delay });
    return id;
  };
  (window as any).clearTimeout = (id: number) => {
    if (!timers.delete(id)) originalClear(id);
  };
  return {
    timers,
    advance() {
      const [id, timer] = timers.entries().next().value as [number, { callback: () => void; delay: number }];
      timers.delete(id);
      timer.callback();
    },
    restore() {
      window.setTimeout = originalSet;
      window.clearTimeout = originalClear;
    },
  };
}

function makeWorker(attempt: () => Promise<void>) {
  const localSyncEvent = new Subject<{ purpose: 'push' | 'pull'; immediate?: boolean }>();
  const db = { localSyncEvent } as any;
  const worker = LocalSyncWorker(db, {} as any, {} as any, attempt as any);
  worker.start();
  return { worker, localSyncEvent };
}

function flush() {
  return new Promise<void>((resolve) => setTimeout(resolve, 10));
}

promisedTest('issue #2350: online wakes paused retry; normal mutations retain backoff', async () => {
  const clock = captureRetryTimers();
  let attempts = 0;
  const { worker, localSyncEvent } = makeWorker(() => {
    ++attempts;
    return attempts === 1 ? Promise.reject(new Error('offline')) : Promise.resolve();
  });
  try {
    localSyncEvent.next({ purpose: 'push' });
    await flush();
    equal(attempts, 1, 'first attempt failed');
    equal([...clock.timers.values()][0].delay, 20000, 'first retry in 20 seconds');
    localSyncEvent.next({ purpose: 'push' });
    await flush();
    equal(attempts, 1, 'ordinary mutation does not cancel backoff');
    localSyncEvent.next({ purpose: 'push', immediate: true });
    await flush();
    equal(attempts, 2, 'online signal causes an immediate new attempt');
    equal(clock.timers.size, 0, 'old retry timer was removed');
  } finally {
    worker.stop();
    clock.restore();
  }
});

promisedTest('issue #2350: failed immediate retry backs off again without overlap', async () => {
  const clock = captureRetryTimers();
  let attempts = 0;
  const { worker, localSyncEvent } = makeWorker(() => {
    ++attempts;
    return Promise.reject(new Error('offline'));
  });
  try {
    localSyncEvent.next({ purpose: 'push' });
    await flush();
    localSyncEvent.next({ purpose: 'push', immediate: true });
    localSyncEvent.next({ purpose: 'push', immediate: true });
    await flush();
    equal(attempts, 2, 'two online signals before the attempt do not overlap');
    equal([...clock.timers.values()][0].delay, 20000, 'new failure starts fresh backoff');
    clock.advance();
    await flush();
    equal(attempts, 3, 'next scheduled retry happens once');
    equal([...clock.timers.values()][0].delay, 40000, 'second retry in 40 seconds');
  } finally {
    worker.stop();
    clock.restore();
  }
});

promisedTest('issue #2350: online during a failed attempt retries once', async () => {
  const clock = captureRetryTimers();
  let attempts = 0;
  let failAttempt: (error: Error) => void = () => {};
  const { worker, localSyncEvent } = makeWorker(() => {
    ++attempts;
    return new Promise<void>((_resolve, reject) => { failAttempt = reject; });
  });
  try {
    localSyncEvent.next({ purpose: 'push' });
    await flush();
    localSyncEvent.next({ purpose: 'push', immediate: true });
    localSyncEvent.next({ purpose: 'push', immediate: true });
    equal(attempts, 1, 'no overlapping request while old attempt is in flight');
    failAttempt(new Error('network changed'));
    await flush();
    equal(attempts, 2, 'one prompt attempt after the failed in-flight request');
    failAttempt(new Error('still offline'));
    await flush();
    equal(attempts, 2, 'wake was consumed: no endless immediate retries');
    equal([...clock.timers.values()][0].delay, 20000, 'failure resumes backoff');
  } finally {
    worker.stop();
    clock.restore();
  }
});

promisedTest('issue #2350: stopped worker cannot retry after reopening', async () => {
  const clock = captureRetryTimers();
  let attempts = 0;
  const first = makeWorker(() => {
    ++attempts;
    return Promise.reject(new Error('offline'));
  });
  try {
    first.localSyncEvent.next({ purpose: 'push' });
    await flush();
    equal(clock.timers.size, 1, 'old worker has a pending retry');
    first.worker.stop();
    equal(clock.timers.size, 0, 'old retry timer removed on close');
    const second = makeWorker(() => {
      ++attempts;
      return Promise.resolve();
    });
    try {
      second.localSyncEvent.next({ purpose: 'push' });
      await flush();
      equal(attempts, 2, 'only reopened worker syncs');
    } finally {
      second.worker.stop();
    }
  } finally {
    first.worker.stop();
    clock.restore();
  }
});

promisedTest('issue #2350: stop after timer fires blocks zero-delay launch', async () => {
  const clock = captureRetryTimers();
  let attempts = 0;
  const { worker, localSyncEvent } = makeWorker(() => {
    ++attempts;
    return Promise.reject(new Error('offline'));
  });
  try {
    localSyncEvent.next({ purpose: 'push' });
    await flush();
    clock.advance(); // Retry callback has fired, but the zero-delay launch has not.
    worker.stop();
    await flush();
    equal(attempts, 1, 'stopped worker did not launch another request');
  } finally {
    worker.stop();
    clock.restore();
  }
});

promisedTest('issue #2350: cancelled sync does not persist stale error', async () => {
  let persisted = false;
  let emitted = false;
  const db = {
    $syncState: { update: () => { persisted = true; return Promise.resolve(); } },
    syncStateChangedEvent: { next: () => { emitted = true; } },
  } as any;
  try {
    await sync(db, {} as any, {} as any, { cancelToken: { cancelled: true } });
  } catch (_error) { /* Expected invalid configuration or cancellation. */ }
  ok(!persisted && !emitted, 'stopped worker cannot overwrite status');
});

promisedTest('issue #2350: cancellation rolls back a pending IndexedDB error write', async () => {
  const db = new Dexie('issue2350-cancelled-error-write');
  db.version(1).stores({ $syncState: '' });
  await db.open();
  const state = db.table('$syncState');
  await state.put({ error: 'before' }, 'syncState');
  const cancelToken = { cancelled: false };
  const originalUpdate = state.update.bind(state);
  let writeStarted: () => void = () => {};
  const started = new Promise<void>((resolve) => { writeStarted = resolve; });
  let releaseWrite: () => void = () => {};
  const hold = new Promise<void>((resolve) => { releaseWrite = resolve; });
  let emitted = false;
  (state as any).update = async (key: string, changes: object) => {
    const result = await originalUpdate(key, changes);
    writeStarted();
    await Dexie.waitFor(hold); // Keep the transaction open until close cancels it.
    return result;
  };
  try {
    const cloudDb = {
      transaction: db.transaction.bind(db),
      $syncState: state,
      syncStateChangedEvent: { next: () => { emitted = true; } },
    } as any;
    const attempt = sync(cloudDb, {} as any, {} as any, { cancelToken }).catch(() => {});
    await started;
    cancelToken.cancelled = true;
    releaseWrite();
    await attempt;
    equal((await state.get('syncState')).error, 'before', 'cancelled write rolled back');
    ok(!emitted, 'old worker did not publish stale status');
  } finally {
    (state as any).update = originalUpdate;
    releaseWrite();
    db.close();
    await db.delete();
  }
});

promisedTest('issue #2350: close during error write aborts stale status', async () => {
  const cancelToken = { cancelled: false };
  let releaseWrite: () => void = () => {};
  let writeStarted = false;
  let emitted = false;
  let aborted = false;
  const db = {
    $syncState: {
      update: () => {
        writeStarted = true;
        return new Promise<void>((resolve) => { releaseWrite = resolve; });
      },
    },
    transaction: async (_mode: string, _table: unknown, work: () => Promise<void>) => {
      try { await work(); } catch (error) { aborted = true; throw error; }
    },
    syncStateChangedEvent: { next: () => { emitted = true; } },
  } as any;
  const attempt = sync(db, {} as any, {} as any, { cancelToken }).catch(() => {});
  await flush();
  ok(writeStarted, 'old worker reached the persisted error write');
  cancelToken.cancelled = true;
  releaseWrite();
  await attempt;
  ok(aborted, 'cancelled error write aborts its transaction');
  ok(!emitted, 'old worker cannot publish error after reopen');
});
