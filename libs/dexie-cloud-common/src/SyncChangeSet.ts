export type SyncChangeSet = {
  [table: string]: {
    upsert?: object[];
    update?: {
      [key: string]: { [keyPath: string]: any };
    };
    delete?: string[];
  };
};
