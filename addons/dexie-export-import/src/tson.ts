import Typeson from 'typeson';
import StructuredCloning from 'typeson-registry/dist/presets/structured-cloning';
import { encode as encodeB64, decode as decodeB64 } from 'base64-arraybuffer-es6';
import Dexie from 'dexie';

export const TSON = new Typeson().register(StructuredCloning);

function readBlobBinary(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    reader.readAsArrayBuffer(blob);
  });
}

const blobType = {
  test(x) { return Typeson.toStringTag(x) === 'Blob'; },
  replace(b) {
    // TODO: Use FileReaderSync
    throw "Blobs can only be encapsulated asynchronically";
  },
  revive ({type, data}) {
    return new Blob([decodeB64(data)], {type});
  }
};

TSON.register({blob: blobType});

TSON.encapsulateAsync = async obj => {
  let cursor = 0;
  const blobs: Blob[] = [];
  const tson = new Typeson().register([
    TSON.types,
    {
      blob: {
        ...blobType,
        replace(b) {
          const result = {
            type: b.type,
            start: cursor,
            end: cursor + b.size
          };
          blobs.push(b);
          cursor += b.size;
          return result;
        }
      }
    }
  ]);
  const result = tson.encapsulate(obj);
  if (blobs.length === 0) return result;
  const ab = await readBlobBinary(new Blob(blobs));

  if (result.$types) {
    let types = result.$types;
    const arrayType = types.$;
    if (arrayType) types = types.$;
    for (let keyPath in types) {
      if (types[keyPath] === 'blob') {
        const b = Dexie.getByKeyPath(result, arrayType ? "$." + keyPath : keyPath);
        b.data = encodeB64(ab.slice(b.start,b.end));
        delete b.start;
        delete b.end;
      }
    }
  }
  return result;
}
