import Events from '../helpers/Events';
import { GlobalDexieEvents } from '../public/types/db-events';

export const DEXIE_STORAGE_MUTATED_EVENT_NAME = 'storagemutated' as 'storagemutated';

// Name of the global event fired using DOM dispatchEvent (if not in node).
// Reason for propagating this as a DOM event is for getting reactivity across
// multiple versions of Dexie within the same app (as long as they are
// compatible with regards to the event data).
// If the ObservabilitySet protocol change in a way that would not be backward
// compatible, make sure also update the event name to a new number at the end
// so that two Dexie instances of different versions continue to work together
//  - maybe not able to communicate but won't fail due to unexpected data in
// the detail property of the CustomEvent. If so, also make sure to udpate
// docs and explain at which Dexie version the new name and format of the event
// is being used.
export const STORAGE_MUTATED_DOM_EVENT_NAME = 'x-storagemutated-1';

export const globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME) as GlobalDexieEvents;
