import {asyncTest, start, stop, ok, equal} from 'qunit';

export function promisedTest(name: string, tester: ()=>Promise<any>) {
  asyncTest(name, async ()=>{
    try {
      await tester();
    } catch (error) {
      ok(false, "Got error: " + (error ?
        error +
          (error.code ? ` (code: ${error.code})` : ``) + 
          (error.stack ? "\n" + error.stack : '') :
        error));
    } finally {
      start();
    }
  });
}
