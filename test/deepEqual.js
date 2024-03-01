import { equal } from 'QUnit';
import sortedJSON from "sorted-json";
import { deepClone } from '../src/functions/utils';

export function deepEqual(actual, expected, description) {
  actual = JSON.parse(JSON.stringify(actual));
  expected = JSON.parse(JSON.stringify(expected));
  actual = sortedJSON.sortify(actual, { sortArray: false });
  expected = sortedJSON.sortify(expected, { sortArray: false });
  equal(JSON.stringify(actual, null, 2), JSON.stringify(expected, null, 2), description);
}
export function isDeepEqual(actual, expected, allowedExtra, prevActual) {
  actual = deepClone(actual);
  expected = deepClone(expected);
  if (allowedExtra) Array.isArray(allowedExtra) ? allowedExtra.forEach(key => {
    if (actual[key]) expected[key] = deepClone(prevActual[key]);
  }) : Object.keys(allowedExtra).forEach(key => {
    if (actual[key]) expected[key] = deepClone(allowedExtra[key]);
  });

  actual = sortedJSON.sortify(actual, { sortArray: false });
  expected = sortedJSON.sortify(expected, { sortArray: false });
  return JSON.stringify(actual, null, 2) === JSON.stringify(expected, null, 2);
}
