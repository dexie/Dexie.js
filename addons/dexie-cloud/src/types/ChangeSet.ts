import { Mut } from "./Mut";

export type ChangeSet = Array<{ table: string; muts: Mut[] }>;
