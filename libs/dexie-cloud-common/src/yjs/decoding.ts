import { YMessage } from './YMessage';
import {
  Decoder,
  readAny,
  readBigUint64,
  readVarString,
  readVarUint8Array,
} from 'lib0/decoding';

export function decodeYMessage(a: Uint8Array): YMessage {
  const decoder = new Decoder(a);
  const type = readVarString(decoder) as YMessage['type'];
  if (type === 'outdated-server-rev') {
    return { type };
  }
  if (type === 'y-complete-sync-done') {
    return { type, yServerRev: readVarString(decoder) };
  }
  const table = readVarString(decoder);
  const prop = readVarString(decoder);

  switch (type) {
    case 'u-ack':
    case 'u-reject':
      return {
        type,
        table,
        prop,
        i: Number(readBigUint64(decoder)),
      };
    default: {
      const k = readAny(decoder);
      switch (type) {
        case 'in-sync':
          return { type, table, prop, k };
        case 'aware':
          return {
            type,
            table,
            prop,
            k,
            u: readVarUint8Array(decoder),
          };
        case 'doc-open':
          return {
            type,
            table,
            prop,
            k,
            serverRev: readAny(decoder),
            sv: readAny(decoder),
          };
        case 'doc-close':
          return { type, table, prop, k };
        case 'sv':
          return {
            type,
            table,
            prop,
            k,
            sv: readVarUint8Array(decoder),
          };
        case 'u-c':
          return {
            type,
            table,
            prop,
            k,
            u: readVarUint8Array(decoder),
            i: Number(readBigUint64(decoder)),
          };
        case 'u-s':
          return {
            type,
            table,
            prop,
            k,
            u: readVarUint8Array(decoder),
            r: (decoder.pos < decoder.arr.length && readVarString(decoder)) || undefined,
          };
        default:
          throw new TypeError(`Unknown message type: ${type}`);
        }
    }
  }
}
