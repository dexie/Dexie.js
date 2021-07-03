import { DBKeyMutation } from "./DBKeyMutation.js";
import { DBKeyMutationSet } from "./DBKeyMutationSet.js";
import { DBOperationsSet } from "../DBOperationsSet.js";
import { DBOperation } from "../DBOperation.js";
import { setByKeyPath } from "../utils.js";

export function applyOperation(
  target: DBKeyMutationSet,
  table: string,
  op: DBOperation
) {
  const tbl = target[table] || (target[table] = {});
  switch (op.type) {
    case "insert":
      // TODO: Don't treat insert and upsert the same?
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
        const changeSpec = op.type === "update"
          ? op.changeSpecs[idx]
          : op.changeSpec;
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
                setByKeyPath(entry.val, propPath, value);
              }
              break;
            case "del":
              // No action.
              break;
            case "upd":
              // Adjust existing update with additional updates
              Object.assign(entry.mod, changeSpec); // May work for deep props as well - new keys is added later, right? Does the prop order persist along TSON and all? But it will not be 100% when combined with some server code (seach for "address.city": "Stockholm" comment)
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
