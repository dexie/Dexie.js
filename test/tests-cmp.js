import Dexie from 'dexie';
import { module, test, equal, ok } from 'QUnit';

function fillArrayBuffer(ab, val) {
  const view = new Uint8Array(ab);
  for (let i = 0; i < view.byteLength; ++i) {
    view[i] = val;
  }
}

module('cmp');

const { cmp } = Dexie;

test('it should support indexable types', () => {
  // numbers
  ok(cmp(1, 1) === 0, 'Equal numbers should return 0');
  ok(cmp(1, 2) === -1, 'Less than numbers should return -1');
  ok(cmp(-1, -2000) === 1, 'Greater than numbers should return 1');
  // strings
  ok(cmp('A', 'A') === 0, 'Equal strings should return 0');
  ok(cmp('A', 'B') === -1, 'Less than strings should return -1');
  ok(cmp('C', 'A') === 1, 'Greater than strings should return 1');
  // Dates
  ok(cmp(new Date(1), new Date(1)) === 0, 'Equal dates should return 0');
  ok(cmp(new Date(1), new Date(2)) === -1, 'Less than dates should return -1');
  ok(
    cmp(new Date(1000), new Date(500)) === 1,
    'Greater than dates should return 1'
  );
  // Arrays
  ok(cmp([1, 2, '3'], [1, 2, '3']) === 0, 'Equal arrays should return 0');
  ok(cmp([-1], [1]) === -1, 'Less than arrays should return -1');
  ok(cmp([1], [-1]) === 1, 'Greater than arrays should return 1');
  ok(cmp([1], [1, 0]) === -1, 'If second array is longer with same leading entries, return -1');
  ok(cmp([1, 0], [1]) === 1, 'If first array is longer with same leading entries, return 1');
  ok(cmp([1], [0,0]) === 1, 'If first array is shorter but has greater leading entries, return 1');
  ok(cmp([0,0], [1]) === -1, 'If second array is shorter but has greater leading entries, return -1');

  /* Binary types
  | DataView
  | Uint8ClampedArray
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;
*/
  const viewTypes = [
    'DataView',
    'Uint8ClampedArray',
    'Uint8Array',
    'Int8Array',
    'Uint16Array',
    'Uint32Array',
    'Int32Array',
    'Float32Array',
    'Float64Array',
  ]
    .map((typeName) => [typeName, self[typeName]])
    .filter(([_, ctor]) => !!ctor); // Don't try to test types not supported by the browser

  const zeroes1 = new ArrayBuffer(16);
  const zeroes2 = new ArrayBuffer(16);
  const ones = new ArrayBuffer(16);
  fillArrayBuffer(zeroes1, 0);
  fillArrayBuffer(zeroes2, 0);
  fillArrayBuffer(ones, 1);

  for (const [typeName, ArrayBufferView] of viewTypes) {
    // Equals
    let v1 = new ArrayBufferView(zeroes1);
    let v2 = new ArrayBufferView(zeroes2);
    ok(cmp(v1, v2) === 0, `Equal ${typeName}s should return 0`);
    // Less than
    v1 = new ArrayBufferView(zeroes1);
    v2 = new ArrayBufferView(ones);
    ok(cmp(v1, v2) === -1, `Less than ${typeName}s should return -1`);
    // Less than
    v1 = new ArrayBufferView(ones);
    v2 = new ArrayBufferView(zeroes1);
    ok(cmp(v1, v2) === 1, `Greater than ${typeName}s should return 1`);
  }
});
test("it should respect IndexedDB's type order", () => {
  const zoo = [
    'meow',
    1,
    new Date(),
    Infinity,
    -Infinity,
    new ArrayBuffer(1),
    [[]],
  ];
  const [minusInfinity, num, infinity, date, string, binary, array] =
    zoo.sort(cmp);
  equal(minusInfinity, -Infinity, 'Minus infinity is sorted first');
  equal(num, 1, 'Numbers are sorted second');
  equal(infinity, Infinity, 'Infinity is sorted third');
  ok(date instanceof Date, 'Date is sorted fourth');
  ok(typeof string === 'string', 'strings are sorted fifth');
  ok(binary instanceof ArrayBuffer, 'binaries are sorted sixth');
  ok(Array.isArray(array), 'Arrays are sorted seventh');
});

test('it should return NaN on invalid types', () => {
  ok(
    isNaN(cmp(1, { foo: 'bar' })),
    'Comparing a number against an object returns NaN (would throw in indexedDB)'
  );
  ok(
    isNaN(cmp({ foo: 'bar' }, 1)),
    'Comparing an object against a number returns NaN also'
  );
});

test('it should treat different binary types as if they were equal', () => {
  const viewTypes = [
    'DataView',
    'Uint8ClampedArray',
    'Uint8Array',
    'Int8Array',
    'Uint16Array',
    'Uint32Array',
    'Int32Array',
    'Float32Array',
    'Float64Array',
  ]
    .map((typeName) => [typeName, self[typeName]])
    .filter(([_, ctor]) => !!ctor); // Don't try to test types not supported by the browser

  const zeroes1 = new ArrayBuffer(16);
  const zeroes2 = new ArrayBuffer(16);
  fillArrayBuffer(zeroes1, 0);
  fillArrayBuffer(zeroes2, 0);

  for (const [typeName, ArrayBufferView] of viewTypes) {
    let v1 = new ArrayBufferView(zeroes1);
    ok(cmp(v1, zeroes1) === 0, `Comparing ${typeName} with ArrayBuffer should return 0 if they have identical data`);
  }
});

test('it should return NaN if comparing arrays where any item or sub array item includes an invalid key', ()=> {
  ok(cmp([1, [[2, "3"]]], [1,[[2, "3"]]]) === 0, "It can deep compare arrays with valid keys (equals)");
  ok(cmp([1, [[2, "3"]]], [1,[[2, 3]]]) === 1, "It can deep compare arrays with valid keys (greater than)");
  ok(isNaN(cmp([1, [[2, 3]]], [1,[[{foo: "bar"}, 3]]])), "It returns NaN when any item in the any of the arrays are invalid keys");
});
