import { CREATE, UPDATE, DELETE } from './change_types';
import combineCreateAndUpdate from './combine-create-and-update.js';
import combineUpdateAndUpdate from './combine-update-and-update.js';

export default function mergeChange(prevChange, nextChange) {
  switch (prevChange.type) {
    case CREATE:
      switch (nextChange.type) {
        case CREATE:
          return nextChange; // Another CREATE replaces previous CREATE.
        case UPDATE:
          return combineCreateAndUpdate(prevChange, nextChange); // Apply nextChange.mods into prevChange.obj
        case DELETE:
          return nextChange; // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
      }
      break;
    case UPDATE:
      switch (nextChange.type) {
        case CREATE:
          return nextChange; // Another CREATE replaces previous update.
        case UPDATE:
          return combineUpdateAndUpdate(prevChange, nextChange); // Add the additional modifications to existing modification set.
        case DELETE:
          return nextChange; // Only send the delete change. What was updated earlier is no longer of interest.
      }
      break;
    case DELETE:
      switch (nextChange.type) {
        case CREATE:
          return nextChange; // A resurection occurred. Only create change is of interest.
        case UPDATE:
          return prevChange; // Nothing to do. We cannot update an object that doesnt exist. Leave the delete change there.
        case DELETE:
          return prevChange; // Still a delete change. Leave as is.
      }
      break;
  }
}
