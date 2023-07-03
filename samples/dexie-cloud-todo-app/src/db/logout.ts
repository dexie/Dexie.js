import { db } from "./db";

export async function logout() {
  await db.delete();
  await db.open();
}