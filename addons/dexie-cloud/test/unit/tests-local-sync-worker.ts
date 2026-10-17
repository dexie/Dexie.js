import { module, ok, equal } from 'qunit';
import { Subject } from 'rxjs';
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
