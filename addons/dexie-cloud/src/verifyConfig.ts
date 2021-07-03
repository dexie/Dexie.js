import Dexie from "dexie";
import { DexieCloudOptions } from "./DexieCloudOptions";

export function verifyConfig({databaseUrl}: DexieCloudOptions = {databaseUrl: ""}) {
  if (!databaseUrl) {
    // Allow not providing databaseURL! Instead, when URL at last is provided,
    // verify after initial handshake that our locally generated schema is compatible
    // with the one from the cloud service. Also check in case we had been connected
    // to another database URL, that we are connecting to the same database ID.
    
    // Clients that are configurable for database url must also be configurable for database name!
  }
}