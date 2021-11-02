import { DBOperation, DBOpPrimaryKey } from "./DBOperation.js";

export type DBOperationsSet<PK=DBOpPrimaryKey> = Array<{ table: string; muts: DBOperation<PK>[] }>;
