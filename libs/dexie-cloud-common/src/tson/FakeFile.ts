import { FakeBlob } from "./FakeBlob.js";

/** This type can be used in Node in order to parse TSON with File type and stringify it down again to JSON.
 * A File is basically a Blob with a name and lastModified.
 */
export class FakeFile {
  blob: FakeBlob;
  name: string;
  lastModified: Date;
  constructor(blob: FakeBlob, name: string, lastModified: Date) {
    this.blob = blob;
    this.name = name;
    this.lastModified = lastModified;
  }
}
