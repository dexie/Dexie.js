import { db } from "./db";

export function logout() {
  return db.cloud.logout().catch(e => {
    console.log("Logout cancelled", e);
  });
}