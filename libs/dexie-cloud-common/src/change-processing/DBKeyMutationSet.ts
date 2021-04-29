import { DBKeyMutation } from "./DBKeyMutation.js";

export type DBKeyMutationSet = {
  [tableName: string]: { [key: string]: DBKeyMutation };
};
