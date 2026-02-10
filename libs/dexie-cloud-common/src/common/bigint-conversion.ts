import { TypedArray } from "../typings/TypedArray.js";
import { b64decode, b64encode } from "./base64.js";

const HEX_PARSER_REGEXP = /[\da-f]{2}/gi;

export function buf2bigint(buf: TypedArray | ArrayBuffer): bigint {
  const bits = BigInt(8);
  let u8a: Uint8Array;
  if (ArrayBuffer.isView(buf)) {
    u8a = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  } else {
    u8a = new Uint8Array(buf);
  }

  let ret = BigInt(0);
  for (let i = 0; i < u8a.length; i++) {
    const bi = BigInt(u8a[i]);
    ret = (ret << bits) | bi;
  }
  return ret;
}

export function bigint2Buf(bi: bigint): Uint8Array {
  if (bi < 0) throw new TypeError("Cannot convert negative bigint to a buffer");
  const hex = bi.toString(16);
  return Uint8Array.from(
    (
      (hex.length % 2 ? "0" + hex : hex).match(HEX_PARSER_REGEXP) || []
    ).map((h) => parseInt(h, 16))
  );
}

export function bigint2B64(bi: bigint): string {
  return b64encode(bigint2Buf(bi));
}

export function b64ToBigInt(base64: string): bigint {
  return buf2bigint(b64decode(base64));
}
