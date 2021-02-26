import { DBCoreMutateRequest } from "dexie";

export interface TXExpandos {
  txid: string;
  mutReqs: {
    [tableName: string]: {
      muts: DBCoreMutateRequest[];
      firstRev: number;
    };
  };
}
