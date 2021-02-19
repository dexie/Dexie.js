import Dexie from "dexie";
import dexieObservable from "dexie-observable";
import dexieSyncable from "dexie-syncable";
import { createIdGenerationMiddleware } from './createIdGenerationMiddleware';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DexieCloudSchema } from './DexieCloudSchema';
import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from './overrideParseStoresSpect';

const DEXIE_CLOUD_PROTOCOL_NAME = "dexiecloud";

dexieSyncable.registerSyncProtocol(
  DEXIE_CLOUD_PROTOCOL_NAME,
  dexieCloudSyncProtocol
);

//
// Extend Dexie interface
//
declare module "dexie" {
  interface Dexie {
    cloud: {
      version: string;
      options: DexieCloudOptions;
      schema: DexieCloudSchema;
      /**
       * Connect to given URL
       */
      configure(options: DexieCloudOptions): Promise<void>;
    };
  }

  interface DexieConstructor {
    Cloud: {
      (db: Dexie): void;

      version: string;
    };
  }
}

export function dexieCloud(db: Dexie) {
  // Make it possible to only add dexieCloud addon by auto-
  // registering the observable and syncable:
  //if (!db.observable) dexieObservable(db);
  //if (!db.syncable) dexieSyncable(db);
  db.cloud = {
    version: "{version}",
    options: {databaseUrl: ""},
    schema: {},
    configure (options: DexieCloudOptions) {
      db.cloud.options = options;
      return db.syncable.connect(DEXIE_CLOUD_PROTOCOL_NAME, options.databaseUrl, options);
      //return Promise.resolve();
    }
  }
  db.Version.prototype["_parseStoresSpec"] = Dexie.override(
    db.Version.prototype["_parseStoresSpec"],
    origFunc => overrideParseStoresSpec(origFunc, db.cloud.schema));

  db.use(createIdGenerationMiddleware(db.cloud.schema));
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
