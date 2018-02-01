/* Keeping this file "js" because typescript wouldn't assist us here (as of Typescript version 2.6.1)
* By keeping it as plain JS, we can supply a corresponding d.ts file with a typed signature.
*/
import { isArray } from './utils';

export function stringifyKey (key) { // key is IndexableType but declaring type here forces us to cast a lot.
  return typeof key === 'string' ?
    // string do not need stringification
    key :
    typeof key === 'number' ?
      // number can be stringified via Number.prototype.toString(). Use (''+key) to invoke:
      ''+key :
      // Now we know key is neither string or number. Check if it is Array:
      isArray(key) ?
        // key is an Array. Not an Typed Array or so - just a plain Array.
        // Array.prototype.toString() would be good enough stringifaction if it wasn't for that contained
        // keys may be of type ArrayBufferView or DataView, so we will have to call ourselves recursively via
        // Array.prototype.map():
        ''+key.map(stringifyKey) :
        // key is any IDBValidKey except Array, string or number:
        'copyWithin' in key ?
          // ArrayBufferView. Use toString() using (''+key) :
          ''+key :
          // key must now be a Date, DataView or ArrayBuffer
          'byteOffset' in key ?
            // DataView
            ''+new Uint8Array(key.buffer, key.byteOffset, key.byteLength) :
            // Date or ArrayBuffer
            'byteLength' in key ?
              // ArrayBuffer
              ''+new Uint8Array(key.buffer) :
              // Date
              ''+key;
}
