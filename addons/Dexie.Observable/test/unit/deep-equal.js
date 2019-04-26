import {equal} from 'QUnit';

// Must use this rather than QUnit's deepEqual() because that one fails on Safari when run via karma-browserstack-launcher
export function deepEqual(a, b, description) {
  equal(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2), description);
}
