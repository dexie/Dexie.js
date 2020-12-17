// Issue #1127. Need another index.ts for the UMD module with only a default export
// like it was before.
// In practice though, the UMD export will also export the named export in 
// https://github.com/dfahlander/Dexie.js/blob/c9187ae60c0d7a424f85bab3af179fbbc9901c8e/src/classes/dexie/dexie-static-props.ts#L223-L228
import Dexie from "./index";
import * as namedExports from "./index";
import { __assign } from 'tslib';
__assign(Dexie, namedExports, {default: Dexie});
export default Dexie;
