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
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    reader.readAsText(blob);
  });
}

export function readBlobBinary(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    reader.readAsArrayBuffer(blob);
  });
}

// Must use this rather than QUnit's deepEqual() because that one fails on Safari when run via karma-browserstack-launcher
export function deepEqual(a: any, b: any, description: string) {
  equal(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2), description);
}
