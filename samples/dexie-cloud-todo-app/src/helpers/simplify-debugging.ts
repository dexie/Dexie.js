import Dexie from "dexie";

//
// Put Dexie on window.
// (makes it possible to use Dexie in devtools console)
//
// Enables an easy way of seeing which version is used and inspect the database:
//
//  > Dexie.semVer
// "3.2.0-beta-2"
//  > Dexie.Cloud.version
//  "1.0.0-beta.6"
//  > await Dexie.getDatabaseNames()
//  (2) ["TodoDBCloud", "TodoDBCloud-z0lesejpr"]
//  > db = await new Dexie("TodoDBCloud-z0lesejpr").open()
//  > db.tables
//  (14) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
//  > await db.table('todoItems').toArray()
//  (8) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]

//@ts-ignore
window.Dexie = Dexie; 
Dexie.debug = true;
