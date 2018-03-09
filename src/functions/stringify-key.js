/* Keeping this file "js" because typescript wouldn't assist us here (as of Typescript version 2.6.1)
* By keeping it as plain JS, we can supply a corresponding d.ts file with a typed signature.
*/
import { isArray } from './utils';
import { exceptions } from '../errors';

export function stringifyKey (key) { // key is IndexableType but declaring type here forces us to cast a lot.
  return typeof key === 'string' ?
    // string do not need stringification
    'S'+key :
    typeof key === 'number' ?
      // number can be stringified via Number.prototype.toString(). Use (''+key) to invoke:
      'N'+key :
      // Now we know key is neither string or number. Check if it is Array:
      isArray(key) ?
        // key is an Array. Not an Typed Array or so - just a plain Array.
        // Array.prototype.toString() would be good enough stringifaction if it wasn't for that contained
        // keys may be of type ArrayBufferView or DataView, so we will have to call ourselves recursively via
        // Array.prototype.map():
        'A'+JSON.stringify(key.map(stringifyKey)) :
        // key is any IDBValidKey except Array, string or number:
        'byteOffset' in key ? // Could also use ArrayBuffer.isView(key) here
          // DataView or ArrayBufferView (for example Uint8Array, Uin16Array, etc).
          // Canonicalize it by stringifying it's underlying buffer as Uint8Array
          'B'+new Uint8Array(key.buffer, key.byteOffset, key.byteLength) :
          // key must now be a Date or ArrayBuffer
          // Date or ArrayBuffer?
          'byteLength' in key ?
            // ArrayBuffer
            'B'+new Uint8Array(key) :
            // Date
            'D'+key.getTime();
}

export function unstringifyKey(str) {
  const value = str.substr(1);
  switch (str[0]) {
    case 'S': return value;
    case 'N': return parseFloat(value);
    case 'A': return JSON.parse(value).map(unstringifyKey);
    case 'B': return new Uint8Array(value.split(','));
    case 'D': return new Date(parseInt(value));
    default: throw new exceptions.InvalidArgument("Invalid key");
  }
}
