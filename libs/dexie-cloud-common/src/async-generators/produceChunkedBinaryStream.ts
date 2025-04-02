/** Used with pipeline to preserve yielded chunks before they are send to peer.
 * Peer can then decode these chunks using consumeChunkedBinaryStream.
 * 
 * Why do we need this? In order to guarantee to the consumer that every chunk is a complete
 * message of some kind, and never cut in the middle - no matter the transfer protocol, proxies
 * etc. In HTTP this can be important because a chunked message can be split into multiple chunks
 * by proxies. This function will make sure that the consumer will never see a chunk that is not
 * a complete message.
 * 
 * The source iterable 
 */
export async function* produceChunkedBinaryStream(source: AsyncIterable<Uint8Array>) {
  const HIGH_WATER_MARK = 65535;
  let len = 0;
  let chunks: Uint8Array[] = [];

  function* flush() {
    const chunkLength = chunks.reduce((a, b) => a + b.length, 0);
    if (chunkLength === 0) return;
    const flushChunkBuffer = new ArrayBuffer(4 + chunkLength);
    const flushChunkArray = new Uint8Array(flushChunkBuffer);
    const dw = new DataView(flushChunkBuffer);
    dw.setUint32(0, chunkLength, false);
    let pos = 4;
    for (const chunk of chunks) {
      flushChunkArray.set(chunk, pos);
      pos += chunk.length;
    }
    len = 0;
    chunks = [];
    yield flushChunkArray;
  }

  for await (const chunk of source) {
    chunks.push(chunk);
    len += chunk.length;
    if (len > HIGH_WATER_MARK) {
      yield* flush();
    }
  }
  yield* flush();
}
