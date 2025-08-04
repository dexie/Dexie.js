declare module 'qunit' {
  interface Assert {
    async(): () => void;
  }
  
  function module(name: string, options?: {
    setup?: () => void;
    teardown?: () => void
  });
  function test(name: string, fn: (assert: Assert) => void): void;
  function test(name: string, fn: () => void): void;
  function asyncTest(name: string, fn: () => void);
  function start();
  function stop();
  function strictEqual(a: any, b: any, description: string);
  function deepEqual(a: any, b: any, description: string);
  function equal(a: any, b: any, description: string);
  function ok(x: any, description: string);
}
