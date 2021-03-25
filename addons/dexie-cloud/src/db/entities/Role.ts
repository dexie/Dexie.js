export interface Role {
  realmId: string;
  name: string;
  permissions: {
    add?: string[] | "*"; // array of tables or "*" (all).
    update?: {
      [tableName: string]: string[] | "*"; // array of properties or "*" (all).
    };
    manage?: string[] | "*"; // array of tables or "*" (all).
  };
}
