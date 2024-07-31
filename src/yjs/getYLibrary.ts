import { exceptions } from "../errors";
import type { Dexie } from "../public/types/dexie";
import type { DucktypedY } from "../public/types/yjs-related";

export function getYLibrary(db: Dexie): DucktypedY {
  const Y = db._options.Y;
  if (!Y) throw new exceptions.MissingAPI('Y library not supplied to Dexie constructor');
  return Y;
}