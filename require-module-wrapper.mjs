// Making the module version consumable via require - to prohibit
// multiple occurrancies of the same module in the same app
// (dual package hazard, https://nodejs.org/api/packages.html#dual-package-hazard)
import Dexie from "./dist/modern/dexie.mjs";
import * as namedExports from ".";
Object.assign(Dexie, namedExports, {default: Dexie});
export default Dexie;
