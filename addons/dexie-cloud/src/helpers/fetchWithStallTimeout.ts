import { SECONDS } from './date-constants';

export const DEFAULT_FETCH_STALL_TIMEOUT = 30 * SECONDS;

export function fetchWithStallTimeout(
  url: string,
  init: RequestInit,
  stallMs: number
): Promise<Response> {
  const controller = new AbortController();
  let onAbort: (() => void) | undefined;

  // If the caller already set a signal, chain abort from it
  if (init.signal) {
    const outerSignal = init.signal;
    if (outerSignal.aborted) {
      controller.abort(outerSignal.reason);
    } else {
      onAbort = () => controller.abort(outerSignal.reason);
      outerSignal.addEventListener('abort', onAbort, { once: true });
    }
  }
  let timer = setTimeout(() => controller.abort(), stallMs);

  const cleanup = () => {
    clearTimeout(timer);
    if (onAbort && init.signal) {
      init.signal.removeEventListener('abort', onAbort);
      onAbort = undefined;
    }
  };

  const bump = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(), stallMs);
  };

  const fetchPromise = fetch(url, { ...init, signal: controller.signal });

  return fetchPromise
    .then((res) => {
      if (res.body) {
        const reader = res.body.getReader();
        const stream = new ReadableStream({
          async pull(ctrl) {
            try {
              const { done, value } = await reader.read();
              if (done) {
                cleanup();
                ctrl.close();
              } else {
                bump();
                ctrl.enqueue(value);
              }
            } catch (e) {
              cleanup();
              ctrl.error(e);
            }
          },
          cancel() {
            cleanup();
            reader.cancel();
            controller.abort();
          },
        });
        return new Response(stream, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }
      cleanup();
      return res;
    })
    .catch((e) => {
      cleanup();
      throw e;
    });
}
