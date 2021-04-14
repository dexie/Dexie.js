import { DBKeyMutation } from "./DBKeyMutation";
import { DBKeyMutationSet } from "./DBKeyMutationSet";
import { DBOperationsSet } from "../DBOperationsSet";
import { DBOperation } from "../DBOperation";
import Dexie from "dexie";

export function applyOperation(
  target: DBKeyMutationSet,
  table: string,
  op: DBOperation
) {
  const tbl = target[table] || (target[table] = {});
  switch (op.type) {
    case "insert":
    case "upsert":
      op.keys.forEach((key, idx) => {
        tbl[key] = {
          type: "ups",
          val: op.values[idx],
        };
      });
      break;
    case "update":
    case "modify": {
      op.keys.forEach((key, idx) => {
        const changeSpec = op.type === "update" ? op.changeSpecs[idx]: op.changeSpec;
        const entry = tbl[key];
        if (!entry) {
          tbl[key] = {
            type: "upd",
            mod: changeSpec,
          };
        } else {
          switch (entry.type) {
            case "ups":
              // Adjust the existing upsert with additional updates
              for (const [propPath, value] of Object.entries(changeSpec)) {
                Dexie.setByKeyPath(entry.val, propPath, value);
              }
              break;
            case "del":
              // No action.
              break;
            case "upd":
              // Adjust existing update with additional updates
              Object.assign(entry.mod, changeSpec);
              break;
          }
        }
      });
      break;
    }
    case "delete":
      op.keys.forEach((key) => {
        tbl[key] = {
          type: "del",
        };
      });
      break;
  }
  return target;
}
