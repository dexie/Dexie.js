import { IndexableType } from "../public/types/indexable-type";

/** Makes any IndexableType instance a string that is unique within it's own
 * type range and satisfies the equality algorithm indexedDB keys, for example
 *  stringifyKey(new Date(1230000000)) === stringifyKey(new Date(1230000000))
 *  stringifyKey(new Uint8Array([1,2,3])) === stringifyKey(new Uint8Array([1,2,3]))
 * 
 * @param key {IndexableType} Key to string
 */
export function stringifyKey (key: IndexableType): string;
export function unstringifyKey (str: string): IndexableType;
