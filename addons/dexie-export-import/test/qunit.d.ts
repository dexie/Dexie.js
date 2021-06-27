declare module 'qunit' {
  function module(name: string, options?: {
    setup?: () => void;
    teardown?: () => void
  });
  function asyncTest(name: string, fn: ()=>void);
  function start();
  function stop();
  function strictEqual(a: any, b: any, description: string);
  function deepEqual(a: any, b: any, description: string);
  function equal(a: any, b: any, description: string);
  function ok(x: any, description: string);
}
