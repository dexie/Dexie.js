import {equal} from 'QUnit';

// Must use this rather than QUnit's deepEqual() because that one fails on Safari when run via karma-browserstack-launcher
export function deepEqual(a, b, description) {
  if (typeof a === 'object' && typeof b === 'object' && a != null && b != null) {
    equal(JSON.stringify(sortMembers(a), null, 2), JSON.stringify(sortMembers(b), null, 2), description);
  } else {
    equal(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2), description);
  }
}

/**
 * 
 * @param {object} obj 
 */
function sortMembers (obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
}
