import { assert } from 'qunit';

export function waitTilEqual(
  getActual: () => any,
  expected: any,
  description: string,
  timeout = 2000
) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const actual = getActual();
      if (actual === expected) {
        clearInterval(interval);
        assert.equal(actual, expected, description);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        assert.equal(actual, expected, description);
        resolve(false);
      }
    }, 10);
  });
}


