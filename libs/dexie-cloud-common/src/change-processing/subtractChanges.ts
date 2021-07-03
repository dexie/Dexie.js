import { setByKeyPath } from '../utils.js';
import { DBKeyMutationSet } from './DBKeyMutationSet.js';

export function subtractChanges(
  target: DBKeyMutationSet, // Server change set
  changesToSubtract: DBKeyMutationSet // additional mutations on client during syncWithServer()
) {
  for (const [table, mutationSet] of Object.entries(changesToSubtract)) {
    for (const [key, mut] of Object.entries(mutationSet)) {
      switch (mut.type) {
        case 'ups':
          {
            const targetMut = target[table]?.[key];
            if (targetMut) {
              switch (targetMut.type) {
                case 'ups':
                  delete target[table][key];
                  break;
                case 'del':
                  // Leave delete operation.
                  // (Don't resurrect objects unintenionally (using tx(get, put) pattern locally))
                  break;
                case 'upd':
                  delete target[table][key];
                  break;
              }
            }
          }
          break;
        case 'del':
          delete target[table]?.[key];
          break;
        case 'upd': {
          const targetMut = target[table]?.[key];
          if (targetMut) {
            switch (targetMut.type) {
              case 'ups':
                // Adjust the server upsert with locally updated values.
                for (const [propPath, value] of Object.entries(mut.mod)) {
                  setByKeyPath(targetMut.val, propPath, value);
                }
                break;
              case 'del':
                // Leave delete.
                break;
              case 'upd':
                // Remove the local update props from the server update mutation.
                for (const propPath of Object.keys(mut.mod)) {
                  delete targetMut.mod[propPath];
                }
                break;
            }
          }
          break;
        }
      }
    }
  }
}
