import { delArrayItem } from "../../functions/utils";
import { CacheEntry } from "../../public/types/cache";

export function subscribeToCacheEntry(cacheEntry: CacheEntry, container: CacheEntry[], requery: ()=>void, signal: AbortSignal) {
  cacheEntry.subscribers.add(requery);
  signal.addEventListener("abort", () => {
    cacheEntry.subscribers.delete(requery);
    if (cacheEntry.subscribers.size === 0) {
      enqueForDeletion(cacheEntry, container);
    }
  });
}


function enqueForDeletion(cacheEntry: CacheEntry, container: CacheEntry[]) {
  setTimeout(() => {
    if (cacheEntry.subscribers.size === 0) { // Still empty (no new subscribers readded after grace time)
      delArrayItem(container, cacheEntry);
    }
  }, 3000);
}
