const hasArrayBufferFromBase64 = "fromBase64" in Uint8Array; // https://github.com/tc39/proposal-arraybuffer-base64;
const hasArrayBufferToBase64 = "toBase64" in Uint8Array.prototype; // https://github.com/tc39/proposal-arraybuffer-base64;

export const b64decode: (b64: string) => Uint8Array =
  typeof Buffer !== "undefined"
    ? (base64) => Buffer.from(base64, "base64") // Node
    : hasArrayBufferFromBase64
    ? // @ts-ignore: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
      (base64) => Uint8Array.fromBase64(base64) // Modern javascript standard
    : (base64) => {
        // Legacy DOM workaround
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
      };

export const b64encode: (b: Uint8Array | Buffer | ArrayBuffer) => string =
  typeof Buffer !== "undefined"
    ? (b) => {
        // Node
        if (ArrayBuffer.isView(b)) {
          return Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString(
            "base64"
          );
        } else {
          return Buffer.from(b).toString("base64");
        }
      }
    : hasArrayBufferToBase64
    ? (b) => {
        // Uint8Array.prototype.toBase64 is available in modern browsers
        const u8a = ArrayBuffer.isView(b) ? b : new Uint8Array(b);
        // @ts-ignore: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
        return u8a.toBase64();
      }
    : (b) => {
        // Legacy DOM workaround
        const u8a = ArrayBuffer.isView(b) ? b : new Uint8Array(b);
        const CHUNK_SIZE = 0x1000;
        const strs: string[] = [];
        for (let i = 0, l = u8a.length; i < l; i += CHUNK_SIZE) {
          const chunk = u8a.subarray(i, i + CHUNK_SIZE) as Uint8Array;
          strs.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        return btoa(strs.join(""));
      };
