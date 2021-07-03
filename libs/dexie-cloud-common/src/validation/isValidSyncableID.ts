import { toStringTag } from "./toStringTag.js";

const validIDTypes = {
  Uint8Array,
};

/** Verifies that given primary key is valid.
 * The reason we narrow validity for valid keys are twofold:
 *  1: Make sure to only support types that can be used as an object index in DBKeyMutationSet.
 *     For example, ArrayBuffer cannot be used (gives "object ArrayBuffer") but Uint8Array can be
 *     used (gives comma-delimited list of included bytes).
 *  2: Avoid using plain numbers and Dates as keys when they are synced, as they are not globally unique.
 *  3: Since we store the key as a VARCHAR server side in current version, try not promote types that stringifies to become very long server side.
 *
 * @param id
 * @returns
 */
export function isValidSyncableID(id: any) {
  if (typeof id === "string") return true;
  //if (validIDTypes[toStringTag(id)]) return true;
  //if (Array.isArray(id)) return id.every((part) => isValidSyncableID(part));
  if (Array.isArray(id) && id.some(key => isValidSyncableID(key)) && id.every(isValidSyncableIDPart)) return true;
  return false;
}


/** Verifies that given key part is valid.
 *  1: Make sure that arrays of this types are stringified correclty and works with DBKeyMutationSet.
 *     For example, ArrayBuffer cannot be used (gives "object ArrayBuffer") but Uint8Array can be
 *     used (gives comma-delimited list of included bytes).
 *  2: Since we store the key as a VARCHAR server side in current version, try not promote types that stringifies to become very long server side.
*/
function isValidSyncableIDPart(part: any) {
  return typeof part === "string" || typeof part === "number" || Array.isArray(part) && part.every(isValidSyncableIDPart);
}

export function isValidAtID(id: any, idPrefix?: string): id is string {
  return !idPrefix || (typeof id === "string" && id.startsWith(idPrefix));
}
