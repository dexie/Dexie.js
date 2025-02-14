export type DexieCloudSchema = {
  [tableName: string]: {
    generatedGlobalId?: boolean;
    idPrefix?: string;
    deleted?: boolean;
    markedForSync?: boolean;
    initiallySynced?: boolean;
    primaryKey?: string
    yProps?: string[];
  };
};
