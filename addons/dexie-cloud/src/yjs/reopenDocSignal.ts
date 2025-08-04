import { Subject } from "rxjs";
import type * as Y from "yjs";

const wm = new WeakMap<Y.Doc, Subject<void>>();

/** A property (package-private) on Y.Doc that is used
 * to signal that the server wants us to send a 'doc-open' message
 * to the server for this document.
 * 
 * @param doc 
 * @returns 
 */
export function getOpenDocSignal(doc: Y.Doc) {
  let signal = wm.get(doc);
  if (!signal) {
    signal = new Subject<void>();
    wm.set(doc, signal);
  }
  return signal;
}