import { DBOperation } from "./DBOperation";

export type DBOperationsSet = Array<{ table: string; muts: DBOperation[] }>;
