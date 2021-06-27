import Dexie from 'dexie';
Dexie.test = true; // Improve code coverage
import "./tests-table.js";
import "./tests-collection.js";
import "./tests-whereclause.js";
import "./tests-transaction.js";
import "./tests-open.js";
import "./tests-yield";
import "./tests-asyncawait.js";
import "./tests-exception-handling.js";
import "./tests-upgrading.js";
import "./tests-misc";
import "./tests-promise.js";
import "./tests-extendability.js";
import "./tests-crud-hooks";
import "./tests-blobs";
import "./tests-binarykeys";
import "./tests-live-query";
import "./tests-rangeset";
//import "./tests-performance.js"; Not required. Should make other performance tests separately instead.
