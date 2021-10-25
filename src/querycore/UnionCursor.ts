import { DBCoreCursor } from "../public/types/dbcore";

export function openUnionCursor(openCursor: ()=>Promise<DBCoreCursor | null>, keyIteratables: Iterable<any>[]) {
  
  return Object.create(cursor, {

  });
}