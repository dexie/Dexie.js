import Dexie from "dexie";

export interface CancelToken {
  cancelled: boolean;
}

export function throwIfCancelled(cancelToken?: CancelToken) {
  if (cancelToken?.cancelled) throw new Dexie.AbortError(`Operation was cancelled`);
}
