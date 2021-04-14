import { DBKeyMutation } from "./DBKeyMutation";

export type DBKeyMutationSet = {
  [tableName: string]: { [key: string]: DBKeyMutation };
};
