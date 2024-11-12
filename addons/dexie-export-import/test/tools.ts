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

export function readBlob(blob: Blob): Promise<string> {
  return blob.text();
}

export function readBlobBinary(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

// Must use this rather than QUnit's deepEqual() because that one fails on Safari when run via karma-browserstack-launcher
export function deepEqual(a: any, b: any, description: string) {
  equal(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2), description);
}
