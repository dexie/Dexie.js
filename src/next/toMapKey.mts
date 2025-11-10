
export function toMapKey(key: IDBValidKey): string | number {
  if (typeof key === 'string') {
    return key;
  } else if (typeof key === 'number') {
    return key;
  } else if (key instanceof Date) {
    return key.getTime();
  } else if (Array.isArray(key)) {
    return (
      '[' +
      key.map((k) => toMapKey(k)).join(',') +
      ']'
    );
  } else if (ArrayBuffer.isView(key)) {
    const bytes = new Uint8Array(key.buffer, key.byteOffset, key.byteLength);
    const bin = String.fromCharCode(...bytes);
    return btoa(bin);
  } else if (key instanceof ArrayBuffer) {
    const bytes = new Uint8Array(key);
    const bin = String.fromCharCode(...bytes);
    return btoa(bin);
  } else {
    return key;
  }
}