import { Dexie } from "../interfaces/dexie";

export let dbNamesDB: Dexie;
export let hasNativeGetDatabaseNames: boolean | undefined;
export let hasGetAll: boolean | undefined;

export function initLazyGlobals () {
  // TODO: Initialize these globals.
}
