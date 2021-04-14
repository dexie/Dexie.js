import { Table } from "dexie";
import { EntityCommon } from "../db/entities/EntityCommon";
import { UserLogin } from "../db/entities/UserLogin";
import { Member } from "../db/entities/Member";
import { UNAUTHORIZED_USER } from "../authentication/UNAUTHORIZED_USER";
import { Realm } from "../db/entities/Realm";

export async function modifyLocalObjectsWithNewUserId(
  syncifiedTables: Table<EntityCommon>[],
  currentUser: UserLogin) {
  for (const table of syncifiedTables) {
    if (table.name === "members") {
      // members
      await table.toCollection().modify((member: Member) => {
        if (member.userId === UNAUTHORIZED_USER.userId) {
          member.userId = currentUser.userId;
        }
      });
    } else if (table.name === "roles") {
      // roles
      // No changes needed.
    } else if (table.name === "realms") {
      // realms
      await table.toCollection().modify((realm: Realm) => {
        if (!realm.owner || realm.owner === UNAUTHORIZED_USER.userId) {
          realm.owner = currentUser.userId;
        }
      });
    } else {
      // application entities
      await table.toCollection().modify((obj) => {
        if (!obj.owner || obj.owner === UNAUTHORIZED_USER.userId)
          obj.owner = currentUser.userId;
        if (!obj.realmId || obj.realmId === UNAUTHORIZED_USER.userId) {
          obj.realmId = currentUser.userId;
        }
      });
    }
  }
}
