import { b64decode, b64encode } from "./base64.js";

export function b64LexEncode(b: Uint8Array | Buffer | ArrayBuffer): string {
  return b64ToLex(b64encode(b));
}

export function b64LexDecode(b64Lex: string): Uint8Array {
  return b64decode(lexToB64(b64Lex));
}

export function b64ToLex(base64: string): string {
  var encoded = "";
  for (var i = 0, length = base64.length; i < length; i++) {
    encoded += ENCODE_TABLE[base64[i]];
  }
  return encoded;
}

export function lexToB64(base64lex: string): string {
  // only accept string input
  if (typeof base64lex !== "string") {
    throw new Error("invalid decoder input: " + base64lex);
  }

  var base64 = "";
  for (var i = 0, length = base64lex.length; i < length; i++) {
    base64 += DECODE_TABLE[base64lex[i]];
  }

  return base64;
}

const DECODE_TABLE = {
  "-": "=",
  "0": "A",
  "1": "B",
  "2": "C",
  "3": "D",
  "4": "E",
  "5": "F",
  "6": "G",
  "7": "H",
  "8": "I",
  "9": "J",
  A: "K",
  B: "L",
  C: "M",
  D: "N",
  E: "O",
  F: "P",
  G: "Q",
  H: "R",
  I: "S",
  J: "T",
  K: "U",
  L: "V",
  M: "W",
  N: "X",
  O: "Y",
  P: "Z",
  Q: "a",
  R: "b",
  S: "c",
  T: "d",
  U: "e",
  V: "f",
  W: "g",
  X: "h",
  Y: "i",
  Z: "j",
  _: "k",
  a: "l",
  b: "m",
  c: "n",
  d: "o",
  e: "p",
  f: "q",
  g: "r",
  h: "s",
  i: "t",
  j: "u",
  k: "v",
  l: "w",
  m: "x",
  n: "y",
  o: "z",
  p: "0",
  q: "1",
  r: "2",
  s: "3",
  t: "4",
  u: "5",
  v: "6",
  w: "7",
  x: "8",
  y: "9",
  z: "+",
  "|": "/",
};

const ENCODE_TABLE = {};
for (const c of Object.keys(DECODE_TABLE)) {
  ENCODE_TABLE[DECODE_TABLE[c]] = c;
}
