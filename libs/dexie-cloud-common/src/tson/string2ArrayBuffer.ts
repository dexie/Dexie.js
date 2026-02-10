export function string2ArrayBuffer(str: string): ArrayBuffer {
  const array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    array[i] = str.charCodeAt(i); // & 0xff;
  }
  return array.buffer;
}

export function arrayBuffer2String(buf: ArrayBuffer): string {
  // TODO: Optimize
  return new Uint8Array(buf).reduce(
    (s, byte) => s + String.fromCharCode(byte),
    ""
  );
}
