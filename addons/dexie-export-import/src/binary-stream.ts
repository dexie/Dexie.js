/* These classes,
  BinaryOutputStream and BinaryInputStream could be used 
  if we should export / import large databases to/from binary
  files instead of plain json format that needs to be kept
  in memory in its whole.

  Using this binary approach would probably be more memory
  sparing but would also make the export file non-readable.

  I'm seeing two variants of dexie export files:
    binary export
    json export
  The binary export would be recommended if database
  size could be more than what could fit into a device ram.
  The json export could be recommended for databases
  up to 100 megabyte.

  It is still not clear whether the user agents natively will
  put the Blobs in memory or on disk. There's a recent issue
  for chromium that should have been solved in Chrome 57, that
  will make sure to put large blobs on disk in case memory is
  low.
*/

export class BinaryOutputStream {
  slices: (Blob | ArrayBuffer)[];

  write(data: string | ArrayBuffer | ArrayBufferView | Blob) {
    const blob = new Blob([data]);
    const sizeBuffer = new ArrayBuffer(4);
    const dw = new DataView(sizeBuffer);
    dw.setUint32(0, blob.size);
    this.slices.push(sizeBuffer);
    this.slices.push(blob);
  }

  toBlob() : Blob {
    return new Blob(this.slices);
  }
}

interface ReadBlobResultType {
  text: string;
  binary: ArrayBuffer;
}

export class BinaryInputStream {
  pos = 0;
  blob: Blob;

  constructor(blob: Blob) {
    this.blob = blob;
  }

  async next<T extends keyof ReadBlobResultType>(type?:T): Promise<{done: boolean, value?: ReadBlobResultType[T]}> {
    if (this.pos >= this.blob.size) return {done: true};
    const sizeBlob = this.blob.slice(this.pos, 4);
    const sizeArr = await readBlob(sizeBlob, 'binary');
    const sizeView = new DataView(sizeArr);
    const size = sizeView.getInt32(0);
    const dataBlob = this.blob.slice(this.pos + 4, this.pos + 4 + size);
    const data = await readBlob(dataBlob, type || 'binary');
    this.pos += 4 + size;
    return {done: false, value: data};
  }

  nextBinary() {
    return this.next('binary');
  }

  nextText() {
    return this.next('text');
  }

  eof(): boolean {
    return this.pos >= this.blob.size;
  }
}

function readBlob<T extends 'text' | 'binary'>(blob: Blob, type: T): Promise<ReadBlobResultType[T]> {
  return new Promise<ReadBlobResultType[T]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    if (type === 'text') {
      reader.readAsText(blob);
    } else {
      reader.readAsArrayBuffer(blob);
    }
  });
}
