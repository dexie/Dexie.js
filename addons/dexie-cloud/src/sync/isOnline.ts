/* Need this because navigator.onLine seems to say "false" when it is actually online.
  This function relies initially on navigator.onLine but then uses online and offline events
  which seem to be more reliable.
*/
export let isOnline = false;
if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
  isOnline = navigator.onLine;
  self.addEventListener('online', ()=>isOnline = true);
  self.addEventListener('offline', ()=>isOnline = false);
}
