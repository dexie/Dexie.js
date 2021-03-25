import { DexieCloudSchema } from "../../DexieCloudSchema";

export interface Schema {
  id: "schema";
  tableAliases: {[tableName: string]: string};
  tables: DexieCloudSchema;
}
