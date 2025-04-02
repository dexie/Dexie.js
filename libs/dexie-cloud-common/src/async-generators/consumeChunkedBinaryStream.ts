export async function* consumeChunkedBinaryStream(
  source: AsyncIterable<Uint8Array>
) {
  let state: number = 0;
  let sizeBuf = new Uint8Array(4);
  let sizeBufPos = 0;
  let bufs: Uint8Array[] = [];
  let len = 0;
  for await (const chunk of source) {
    const dw = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    let pos = 0;
    while (pos < chunk.byteLength) {
      switch (state) {
        case 0:
          // Beginning of a size header
          if (pos + 4 > chunk.byteLength) {
            for (const b of chunk.slice(pos)) {
              if (sizeBufPos === 4) break;
              sizeBuf[sizeBufPos++] = b;
              ++pos;
            }
            if (sizeBufPos < 4) {
              // Need more bytes in order to read length.
              // Will go out from while loop as well because pos is defenitely = chunk.byteLength here.
              break;
            }
          } else if (sizeBufPos > 0 && sizeBufPos < 4) {
            for (const b of chunk.slice(pos, pos + 4 - sizeBufPos)) {
              sizeBuf[sizeBufPos++] = b;
              ++pos;
            }
          }
        // Intentional fall-through...
        case 1:
          len =
            sizeBufPos === 4
              ? new DataView(sizeBuf.buffer, 0, 4).getUint32(0, false)
              : dw.getUint32(pos, false);
          if (sizeBufPos) sizeBufPos = 0; // in this case pos is already forwarded
          else pos += 4; // else pos is not yet forwarded - that's why we do it now
        // Intentional fall-through...
        case 2:
          // Eat the chunk
          if (pos >= chunk.byteLength) {
            state = 2;
            break;
          }
          if (pos + len > chunk.byteLength) {
            bufs.push(chunk.slice(pos));
            len -= (chunk.byteLength - pos);
            state = 2;
            pos = chunk.byteLength; // will break while loop.
          } else {
            if (bufs.length > 0) {
              const concats = new Uint8Array(bufs.reduce((p,c) => p + c.byteLength, len));
              let p = 0;
              for (const buf of bufs) {
                concats.set(buf, p);
                p += buf.byteLength;
              }
              concats.set(chunk.slice(pos, pos + len), p);
              bufs = [];
              yield concats;
            } else {
              yield chunk.slice(pos, pos + len);
            }
            pos += len;
            state = 0;
          }
          break;
      }
    }
  }
}
