// Making the module version consumable via require - to prohibit
// multiple occurrancies of the same module in the same app
// (dual package hazard, https://nodejs.org/api/packages.html#dual-package-hazard)
import Dexie from "./dist/dexie.js";
const { liveQuery, mergeRanges, rangesOverlap, RangeSet, cmp } = Dexie;
export { liveQuery, mergeRanges, rangesOverlap, RangeSet, cmp, Dexie };
export default Dexie;
