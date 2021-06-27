import { EntityCommon } from "../db/entities/EntityCommon";

export function extractRealm(obj: EntityCommon) {
  return obj?.realmId;
}
