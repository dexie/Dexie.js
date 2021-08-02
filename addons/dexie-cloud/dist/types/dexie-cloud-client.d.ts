import Dexie from 'dexie';
import './extend-dexie-interface';
export { DexieCloudTable } from './extend-dexie-interface';
export declare function dexieCloud(dexie: Dexie): void;
export declare namespace dexieCloud {
    var version: string;
}
export default dexieCloud;
