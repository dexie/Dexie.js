export async function* readableStreamIterator(
  stream: ReadableStream<Uint8Array>
): AsyncIterator<Blob | null, void, number> {
  const chunks: (Blob | null)[] = [];
  const reader = stream.getReader();

  try {
    let chunk = 0;
    let posInChunk = 0;
    let pos = 0;
    let size = 0;
    let done = false;
    let chunkSize = yield null;

    while (!done) {
      while (bytesLeft() < chunkSize && !done) {
        await fill();
      }
      yield read(chunkSize);
      chunkSize = yield null;
    }

    async function fill() {
      const x = await reader.read();
      if (x.value) {
        chunks.push(new Blob([x.value as BlobPart]));
        size += x.value.length;
      }
      if (x.done) done = true;
    }

    function bytesLeft() {
      return size - pos;
    }

    function read(num: number): Blob {
      // Base case: reading 0 bytes returns empty Blob
      if (num === 0) return new Blob([]);
      if (bytesLeft() < num) throw new Error(`Tried to read too much`);
      
      const currentChunk = chunks[chunk];
      if (!currentChunk) throw new Error(`Chunk ${chunk} is null or undefined`);
      
      const readableAmount = currentChunk.size - posInChunk;
      if (num < readableAmount) {
        const part = currentChunk.slice(posInChunk, posInChunk + num);
        posInChunk += num;
        pos += num;
        return new Blob([part]);
      } else {
        const part = currentChunk.slice(posInChunk);
        // Release consumed chunk for GC
        chunks[chunk] = null;
        ++chunk;
        pos += readableAmount;
        posInChunk = 0;
        return new Blob([part, read(num - readableAmount)]);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
