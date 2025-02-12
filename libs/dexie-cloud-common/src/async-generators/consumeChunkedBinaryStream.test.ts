import { set } from 'lib0/encoding';
import { consumeChunkedBinaryStream } from './consumeChunkedBinaryStream';
import { asyncIterablePipeline } from './asyncIterablePipeline';

const inputData = generateInputData(256, 4);

function generateInputData(chunkSize: number, numChunks = 4) {
  const buf = new ArrayBuffer((chunkSize + 4) * numChunks);
  for (let chunkNo = 0; chunkNo < numChunks; ++chunkNo) {
    const dw = new DataView(buf, chunkNo * (chunkSize + 4), 4);
    const ba = new Uint8Array(buf, chunkNo * (chunkSize + 4) + 4, chunkSize);
    dw.setUint32(0, chunkSize, false);
    for (let i = 0; i < ba.length; ++i) {
      ba[i] = i % 256;
    }
  }
  const ba = new Uint8Array(buf, 0, buf.byteLength);
  expect(ba.length).toBe(chunkSize * numChunks + 4 * numChunks);
  expect(new DataView(ba.buffer, 0, 4).getUint32(0, false)).toBe(chunkSize);
  expect(ba[4]).toBe(0);
  expect(ba[5]).toBe(1);
  expect(ba[6]).toBe(2);
  expect(ba[7]).toBe(3);
  return ba;
}

async function* generateChunk(chunkSizes: AsyncGenerator<number>) {
  for await (const chunkSize of chunkSizes) {
    for (let i = 0; i < inputData.length; i += chunkSize) {
      //console.log('Yielding chunk of size ' + (''+i)+':'+(i + chunkSize));
      yield inputData.slice(i, i + chunkSize);
    }
  }
}

async function* generateChunkSizes() {
  //console.log('yield 1024');
  yield 1040;
  //console.log('yield 512');
  yield 520;
  yield 260;
  yield 1;
  yield 259;
  yield 258;
  yield 257;
  yield 2;
  yield 3;
}

test('test consumeChunkedBinaryStream', async () => {
  await asyncIterablePipeline(
    generateChunkSizes,
    generateChunk,
    consumeChunkedBinaryStream,
    async function* (source: AsyncGenerator<Uint8Array>) {
      let itRes: IteratorResult<Uint8Array>;
      for (let i = 0; i < 9; ++i) {
        itRes = await source.next();
        expect(itRes.done).toBe(false);
        expect(itRes.value.byteLength).toBe(256);
        expect(itRes.value).toEqual(inputData.slice(4, 260));
        itRes = await source.next();
        expect(itRes.done).toBe(false);
        expect(itRes.value.byteLength).toBe(256);
        expect(itRes.value).toEqual(inputData.slice(4, 260));
        itRes = await source.next();
        expect(itRes.done).toBe(false);
        expect(itRes.value.byteLength).toBe(256);
        expect(itRes.value).toEqual(inputData.slice(4, 260));
        itRes = await source.next();
        expect(itRes.done).toBe(false);
        expect(itRes.value.byteLength).toBe(256);
        expect(itRes.value).toEqual(inputData.slice(4, 260));
      }
      itRes = await source.next();
      expect(itRes.done).toBe(true);
    }
  );
});
