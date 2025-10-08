import * as React from 'react';

/** {@link React.use} if supported, else fallback */
export const usePromise: <T>(promise: PromiseLike<T>) => T =
  React.use ?? fallbackUsePromise;

/** Fallback for `React.use` with promise */
function fallbackUsePromise<T>(promise: PromiseLike<T>): T {
  const state = PROMISE_STATE_MAP.get(promise);

  if (!state) {
    PROMISE_STATE_MAP.set(promise, { status: 'pending' });
    promise.then(
      (value) => {
        PROMISE_STATE_MAP.set(promise, { status: 'fulfilled', value });
      },
      (reason) => {
        PROMISE_STATE_MAP.set(promise, { status: 'rejected', reason });
      }
    );
    throw promise;
  }

  switch (state.status) {
    case 'pending':
      throw promise;
    case 'rejected':
      throw state.reason;
    case 'fulfilled':
      return state.value;
  }
}

const PROMISE_STATE_MAP = new WeakMap<
  PromiseLike<any>,
  PromiseSettledResult<any> | { status: 'pending' }
>();
