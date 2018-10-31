import Typeson from 'typeson';
import StructuredCloning from 'typeson-registry/dist/presets/structured-cloning';

export const TSON = new Typeson().register(StructuredCloning);

function string2arraybuffer (str) {
  const array = new Uint8Array(str.length);
  for (let i = 0, l=str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

// Replace the blob definition from StructuredCloning to one that generates base64 data instead.
TSON.register({
    blob: {
        test (x) { return Typeson.toStringTag(x) === 'Blob'; },
        replace (b) { // Sync
            const req = new XMLHttpRequest();
            req.open('GET', URL.createObjectURL(b), false); // Sync
            //if (typeof TextEncoder !== 'undefined') { // Using TextDecoder/TextEncoder used too much space
                req.overrideMimeType('text/plain; charset=ISO8859-1');
                //req.overrideMimeType('text/plain; charset=utf-16le');
            //}
            if (req.status !== 200 && req.status !== 0) {
                throw new Error('Bad Blob access: ' + req.status);
            }
            req.send();
            return {
                type: b.type,
                data: string2arraybuffer(req.responseText)
            };
        },
        revive ({type, data}) {
            return new Blob([data], {type});
        },
        replaceAsync (b) {
            return new Typeson.Promise((resolve, reject) => {
                if (b.isClosed) { // On MDN, but not in https://w3c.github.io/FileAPI/#dfn-Blob
                    reject(new Error('The Blob is closed'));
                    return;
                }
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    resolve({
                        type: b.type,
                        data: reader.result
                    });
                });
                reader.addEventListener('error', () => {
                    reject(reader.error);
                });
                reader.readAsArrayBuffer(b);
            });
        }
    }
});
