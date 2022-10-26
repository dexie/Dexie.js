import { db } from "./db";

export async function logout() {
  await db.delete();
  window.location.reload();
}