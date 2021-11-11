import { db } from "./db";

export async function resetDatabase() {
  await db.delete();
  window.location.reload();
  /*return db.transaction('rw', db.todoLists, db.todoItems, async () => {
    await db.todoItems
      .filter((tdi) => !tdi.realmId || tdi.realmId === db.cloud.currentUserId)
      .delete();
    await db.todoLists
      .filter((tdl) => !tdl.realmId || tdl.realmId === db.cloud.currentUserId)
      .delete();
    await populate();
  });*/
}
