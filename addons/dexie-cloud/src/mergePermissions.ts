// TODO: Move to dexie-cloud-common

import { DBPermissionSet } from 'dexie-cloud-common';

export function mergePermissions(
  ...permissions: DBPermissionSet[]
): DBPermissionSet {
  if (permissions.length === 0) return {};
  const reduced = permissions.reduce((result, next) => {
    const ret = { ...result } as DBPermissionSet;
    for (const [verb, rights] of Object.entries(next) as [
      keyof DBPermissionSet,
      DBPermissionSet[keyof DBPermissionSet]
    ][]) {
      if (verb in ret && ret[verb]) {
        if (ret[verb] === '*') continue;
        if (rights === '*') {
          ret[verb] = '*';
        } else if (Array.isArray(rights) && Array.isArray(ret[verb])) {
          // Both are arrays (verb is 'add' or 'manage')
          const r = ret as { [v in typeof verb]?: string[] };
          const retVerb = r[verb]!; // "!" because Array.isArray(ret[verb])
          r[verb] = [...new Set([...retVerb, ...rights])];
        } else if (
          typeof rights === 'object' &&
          rights &&
          typeof ret[verb] === 'object'
        ) {
          // Both are objects (verb is 'update')
          const mergedRights = ret[verb] as {
            [tableName: string]: '*' | string[];
          }; // because we've checked that typeof ret[verb] === 'object' and earlier that not ret[verb] === '*'.
          for (const [tableName, tableRights] of Object.entries(rights) as [
            string,
            string[] | '*'
          ][]) {
            if (mergedRights[tableName] === '*') continue;
            if (tableRights === '*') {
              mergedRights[tableName] = '*';
            } else if (
              Array.isArray(mergedRights[tableName]) &&
              Array.isArray(tableRights)
            ) {
              mergedRights[tableName] = [
                ...new Set([...mergedRights[tableName], ...tableRights]),
              ];
            }
          }
        }
      } else {
        /* This compiles without type assertions. Keeping the comment to
           explain why we do tsignore on the next statement.
        if (verb === "add") {
          ret[verb] = next[verb];
        } else if (verb === "update") {
          ret[verb] = next[verb];
        } else if (verb === "manage") {
          ret[verb] = next[verb];
        } else {
          ret[verb] = next[verb];
        }
        */
        //@ts-ignore
        ret[verb] = next[verb];
      }
    }
    return ret;
  });
  return reduced;
}
