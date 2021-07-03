export type DBKeyMutation =
  | DBKeyUpsert
  | DBKeyUpdate
  | DBKeyDelete;

export interface DBKeyUpsert {
  type: "ups";
  val: any;
}

export interface DBKeyUpdate {
  type: "upd";
  mod: { [keyPath: string]: any };
}

export interface DBKeyDelete {
  type: "del";
}
