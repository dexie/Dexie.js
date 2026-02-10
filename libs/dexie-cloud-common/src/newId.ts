import { b64LexEncode, b64LexDecode } from "./common/b64lex.js";

const getRandomValues: (buf: Uint8Array) => void =
  typeof crypto !== "undefined"
    ? crypto.getRandomValues.bind(crypto)
    : (buf: Uint8Array) => {
        for (let i = 0; i < buf.length; ++i) {
          buf[i] = Math.floor(Math.random() * 256);
        }
      };

let time = 0;
/**
 * Generates a valid version 4 UUID but replacing bytes 0-6 with a timestampish value
 * instead of random, similary to UUID version 1 but with random istead of MAC address.
 *
 * With "timestampish" we mean milliseconds from 1970 approximately, as in bulk-creation
 * scenarios, milliseconds in future will be used (while creating more than 1 id per
 * millisecond)
 *
 * This is similary UUID version 1 but with random instead of Mac, and with
 * support for generating unique IDs the same millisecond.
 *
 * It's even more similar to the "version 6" proposal at
 * https://bradleypeabody.github.io/uuidv6/.
 *
 * Difference from "version 6" proposal is that we keep the clock-sequence within
 * the timestamp part to allow 9 more bits for randomness. This is at the cost of
 * knwoing how exact the time-stamp is. But since we anyway don't expect a perfect
 * time stamps as many clients may have wrong time settings, what we want is just
 * a sorted ID, still universially unique.
 *
 * Random part is totally 73 bits entropy, which basically means that a collisions would
 * be likely if 9 444 732 965 739 290 427 392 devices was generating ids during the exact same
 * millisecond.
 *
 */
export function newId(): string {
  const a = new Uint8Array(18);
  const timePart = new Uint8Array(a.buffer, 0, 6);
  const now = Date.now(); // Will fit into 6 bytes until year 10 895.
  if (time >= now) {
    // User is bulk-creating objects the same millisecond.
    // Increment the time part by one millisecond for each item.
    // If bulk-creating 1,000,000 rows client-side in 0 seconds,
    // the last time-stamp will be 1,000 seconds in future, which is no biggie at all.
    // The point is to create a nice order of the generated IDs instead of
    // using random ids.
    ++time;
  } else {
    time = now;
  }
  timePart[0] = time / 0x10000000000;
  timePart[1] = time / 0x100000000;
  timePart[2] = time / 0x1000000;
  timePart[3] = time / 0x10000;
  timePart[4] = time / 0x100;
  timePart[5] = time;
  const randomPart = new Uint8Array(a.buffer, 6);
  getRandomValues(randomPart);
  //randomPart[0] = randomPart[0] & 0x0f | 0x04; // UUID version 4.
  //randomPart[2] = randomPart[2] & 0x07 | 0x08; // Variant 1.
  return b64LexEncode(a);
}

/* Vi behöver hookar i Dexie som kan emulera andra typer.

  * hook writing och hook reading
  * hook transform-key och retransform-key

*/
