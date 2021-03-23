export type DexieCloudSchema = {
  [tableName: string]: {
    generatedGlobalId?: boolean;
    sync?: boolean;
    idPrefix?: string;
  };
};
