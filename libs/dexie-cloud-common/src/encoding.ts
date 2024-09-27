import { YMessage } from './YMessage';
import {
  Encoder,
  writeVarString,
  writeBigUint64,
  writeAny,
  toUint8Array,
  writeVarUint8Array,
} from 'lib0/encoding.js';

export function encodeYMessage(msg: YMessage): Uint8Array {
  const encoder = new Encoder();
  writeVarString(encoder, msg.type);
  writeVarString(encoder, msg.table);
  writeVarString(encoder, msg.prop);

  switch (msg.type) {
    case 'u-ack':
    case 'u-reject':
      writeBigUint64(encoder, BigInt(msg.i));
      break;
    default:
      writeAny(encoder, msg.k);
      switch (msg.type) {
        case 'aware':
          writeVarUint8Array(encoder, msg.u);
          break;
        case 'doc-open':
          writeAny(encoder, msg.serverRev);
          writeAny(encoder, msg.sv);
          break;
        case 'doc-close':
          break;
        case 'sv':
          writeVarUint8Array(encoder, msg.sv);
          break;
        case 'u-c':
          writeVarUint8Array(encoder, msg.u);
          writeBigUint64(encoder, BigInt(msg.i));            
          break;
        case 'u-s':
          writeVarUint8Array(encoder, msg.u);
          break;
        case 'in-sync':
          break;
      }
  }
  return toUint8Array(encoder);
}
