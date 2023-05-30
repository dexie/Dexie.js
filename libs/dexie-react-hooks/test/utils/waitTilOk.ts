import { assert } from 'qunit';

export function waitTilOk(
  evaluateCondition: () => boolean,
  description: string,
  timeout = 2000
) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (evaluateCondition()) {
        clearInterval(interval);
        assert.ok(true, description);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        assert.ok(false, description);
        resolve(false);
      }
    }, 10);
  });
}
