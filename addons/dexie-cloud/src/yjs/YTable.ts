import { EntityTable } from "dexie";
import type { YUpdateRow } from "y-dexie";

export type YTable = EntityTable<YUpdateRow, "i">;
