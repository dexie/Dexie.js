import {
  globalEvents,
  STORAGE_MUTATED_DOM_EVENT_NAME,
  DEXIE_STORAGE_MUTATED_EVENT_NAME,
} from '../globals/global-events';
import { propagateLocally, propagatingLocally } from './propagate-locally';

export let bc: BroadcastChannel;

export let createBC = ()=>{};

if (typeof BroadcastChannel !== 'undefined') {
  createBC = () => {
    bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
    bc.onmessage = ev => ev.data && propagateLocally(ev.data);
  }
  createBC();

  /**
   * The Node.js BroadcastChannel will prevent the node process from exiting
   * if the BroadcastChannel is not closed.
   * Therefore we have to call unref() which allows the process to finish
   * properly even when the BroadcastChannel is never closed.
   * @link https://nodejs.org/api/worker_threads.html#broadcastchannelunref
   * @link https://github.com/dexie/Dexie.js/pull/1576
   */
  if (typeof (bc as any).unref === 'function') {
    (bc as any).unref();
  }
  
  //
  // Propagate local changes to remote tabs, windows and workers via BroadcastChannel
  //
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
    if (!propagatingLocally) {
      bc.postMessage(changedParts);
    }
  });
}
