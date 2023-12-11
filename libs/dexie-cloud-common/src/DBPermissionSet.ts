// add = add new objects + update + delete own objects.
// update = update given fields on given tables.
// manage = add/update/delete any object of given type within realm.
export interface DBPermissionSet {
  add?: '*' | string[]; // tableName(s) or "*"
  update?:
    | '*' // Update all fields on all tables
    | {
        [tableName: string]: string[] | '*'; // array of properties or "*" (all).
      };
  manage?: '*' | string[]; // tableName(s) or "*"
}
