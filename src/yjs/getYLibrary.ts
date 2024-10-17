import { exceptions } from "../errors";
import type { Dexie } from "../public/types/dexie";
import type { YjsLib } from "../public/types/yjs-related";

export function getYLibrary(db: Dexie): YjsLib {
  const Y = db._options.Y;
  if (!Y) throw new exceptions.MissingAPI('Y library not supplied to Dexie constructor');
  return Y;
}