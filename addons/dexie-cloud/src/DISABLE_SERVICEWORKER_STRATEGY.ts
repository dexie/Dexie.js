import { isFirefox } from './isFirefox';
import { isSafari, safariVersion } from './isSafari';

// What we know: Safari 14.1 (version 605) crashes when using dexie-cloud's service worker.
// We don't know what exact call is causing this. Have tried safari-14-idb-fix with no luck.
// Something we do in the service worker is triggering the crash.
// When next Safari version (606) is out we will start enabling SW again, hoping that the bug is solved.
// If not, we might increment 605 to 606.
export const DISABLE_SERVICEWORKER_STRATEGY =
  (isSafari && safariVersion <= 605) || // Disable for Safari for now.
  isFirefox; // Disable for Firefox for now. Seems to have a bug in reading CryptoKeys from IDB from service workers
