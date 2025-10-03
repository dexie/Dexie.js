import { getByKeyPath, keys, setByKeyPath } from './utils';
import { PropModification } from "../helpers/prop-modification";

export function applyUpdateSpec(
  obj: any,
  changes: { [keyPath: string]: any }
): boolean {
  const keyPaths = keys(changes);
  const numKeys = keyPaths.length;
  let anythingModified = false;
  for (let i = 0; i < numKeys; ++i) {
    const keyPath = keyPaths[i];
    const value = changes[keyPath];
    const origValue = getByKeyPath(obj, keyPath);
    if (value instanceof PropModification) {
      setByKeyPath(obj, keyPath, value.execute(origValue));
      anythingModified = true;
    } else if (origValue !== value) {
      setByKeyPath(obj, keyPath, value); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
      anythingModified = true;
    }
  }
  return anythingModified;
}
