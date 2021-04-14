export type DexieCloudSchema = {
  [tableName: string]: {
    generatedGlobalId?: boolean;
    idPrefix?: string;
    deleted?: boolean;
  };
};
