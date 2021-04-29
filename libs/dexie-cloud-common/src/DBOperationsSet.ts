import { DBOperation } from "./DBOperation.js";

export type DBOperationsSet = Array<{ table: string; muts: DBOperation[] }>;
