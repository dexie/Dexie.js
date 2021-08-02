import Dexie from "dexie";
export declare function dbOnClosed(db: Dexie, handler: () => void): () => void;
