/* Need this because navigator.onLine seems to say "false" when it is actually online.
  This function relies initially on navigator.onLine but then uses online and offline events
  which seem to be more reliable.
*/
export let isOnline = navigator.onLine;
self.addEventListener('online', ()=>isOnline = true);
self.addEventListener('offline', ()=>isOnline = false);
