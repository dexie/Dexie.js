export function randomString(bytes: number) {
  const buf = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  if (typeof Buffer !== 'undefined' && Buffer.from) {
    return Buffer.from(buf).toString('base64');
  } else if (typeof btoa !== 'undefined') {
    return btoa(String.fromCharCode.apply(null, buf));
  } else {
    throw new Error('No btoa or Buffer available');
  }
}
