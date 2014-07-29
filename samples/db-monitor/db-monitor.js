/// <reference path="../../src/Dexie.js" />
/// <reference path="../../addons/Dexie.Observable/Dexie.Observable.js" />
/// <reference path="https://code.jquery.com/jquery-2.1.1.js" />

function DBMonitor(searchBox, tbody) {
    var searchValue = searchBox.val();
    var databases = [];
    reload();

    searchBox.change(updateSearch);
    window.addEventListener('storage', function (event) {
        if (event.key === "Dexie.DatabaseNames") {
            reload();
        }
    });

    reload();

    function reload() {
        databases.forEach(function (db) {
            db.close();
        });
        Dexie.getDatabaseNames(function (names) {
            for (var i = 0; i < names.length; ++i) {
                var db = new Dexie(names[i]);
                db.
            }
        });
    }
}
