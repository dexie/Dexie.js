import { toStringTag } from "./toStringTag";

const validIDTypes = {
  Uint8Array,
};

/** Verifies that given primary key is valid.
 * The reason we narrow validity for valid keys are twofold:
 *  1: Make sure to only support types that can be used as an object index in DBKeyMutationSet.
 *     For example, ArrayBuffer cannot be used (gives "object ArrayBuffer") but Uint8Array can be
 *     used (gives comma-delimited list of included bytes).
 *  2: Avoid using numbers and Dates as keys when they are synced, as they are not globally unique.
 *
 * @param id
 * @returns
 */
export function isValidSyncableID(id: any) {
  if (typeof id === "string") return true;
  if (validIDTypes[toStringTag(id)]) return true;
  if (Array.isArray(id)) return id.every((part) => isValidSyncableID(part));
}

export function isValidAtID(id: any, idPrefix?: string): id is string {
  return !idPrefix || (typeof id === "string" && id.startsWith(idPrefix));
}
