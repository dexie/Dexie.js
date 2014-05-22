///<reference path="run-unit-tests.html" />


(function () {

    var db = new Dexie("TestDB-WhereClause");
    db.version(1).stores({
        folders: "++id,&path",
        files: "++id,filename,extension,[filename+extension],folderId"
    });

    var Folder = db.folders.defineClass({
        id: Number,
        path: String,
        description: String
    });

    var File = db.files.defineClass({
        id: Number,
        filename: String,
        extension: String,
        folderId: Number
    });

    File.prototype.getFullPath = function (trans) {
        var file = this;
        return (trans || db).table("folders").get(this.folderId, function (folder) {
            return folder.path + "/" + file.filename + (file.extension || "");
        });
    }

    db.on("populate", function(trans) {
        var folders = trans.table("folders");
        var files = trans.table("files");
        folders.add({path: "/", description: "Root folder"}); // 1
        folders.add({path: "/usr"}); // 2
        folders.add({path: "/usr/local"}); // 3
        folders.add({ path: "/usr/local/bin" }).then(function (id) { // 4
            files.add({filename: "Hello", folderId: id});
            files.add({filename: "hello", extension: ".exe", folderId: id});
        });
        folders.add({ path: "/usr/local/src" }).then(function (id) { // 5
            files.add({filename: "world", extension: ".js", folderId: id});
            files.add({filename: "README", extension: ".TXT", folderId: id});
        });
        folders.add({ path: "/usr/local/var" }); // 6
        folders.add({ path: "/USR/local/VAR" }); // 7
        folders.add({path: "/var"}); // 8
        folders.add({ path: "/var/bin" }).then(function (id) { // 9
            files.add({filename: "hello-there", extension: ".exe", folderId: id});
        });
    });

    module("WhereClause", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open();
                start();
            }).catch(function (e) {
                ok(false, "Error deleting database: " + e);
                start();
            });
        },
        teardown: function () {
            stop(); db.delete().finally(start);
        }
    });


    asyncTest("anyOf()", function () {
        db.transaction("r", [db.files, db.folders], function (files, folders, transaction) {

            files.where("filename").anyOf("hello", "hello-there", "README", "gösta").toArray(function (a) {
                equal(a.length, 3, "Should find 3 files");
                equal(a[0].filename, "README", "First match is README because capital R comes before lower 'h' in lexical sort");
                equal(a[1].filename, "hello", "Second match is hello");
                equal(a[2].filename, "hello-there", "Third match is hello-there");

                a[0].getFullPath(transaction).then(function (fullPath) {
                    equal(fullPath, "/usr/local/src/README.TXT", "Full path of README.TXT is: " + fullPath);
                });
                a[1].getFullPath(transaction).then(function (fullPath) {
                    equal(fullPath, "/usr/local/bin/hello.exe", "Full path of hello.exe is: " + fullPath);
                });
                a[2].getFullPath(transaction).then(function (fullPath) {
                    equal("/var/bin/hello-there.exe", fullPath, "Full path of hello-there.exe is: " + fullPath);
                });
            });

        }).catch(function (e) {
            ok(false, "Error: " + e.stack || e);
        }).finally(start);
    });

    asyncTest("anyOf(integerArray)", function () {
        // Testing bug #11 Integer Indexes in anyOf handled incorrectly
        db.files.where('id').anyOf([2, 11]).toArray(function (a) {
            equal(a.length, 1, "Should be only one found entry");
            equal(a[0].id, 2, "Item no 2 should be found");
        }).finally(start);
    });

    asyncTest("equalsIgnoreCase()", function () {

        db.files.where("filename").equalsIgnoreCase("hello").toArray(function (a) {
            equal(a.length, 2, "Got two files");
            equal(a[0].filename, "Hello", "First file is Hello");
            equal(a[1].filename, "hello", "Second file is hello");
            start();
        });

    });

    asyncTest("equalsIgnoreCase() 2", function () {
        var folder = new Folder();
        folder.path = "/etc";
        folder.description = "Slasktratten";
        db.folders.add(folder).then(function (folderId) {
            var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster",
					"Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta",
					"apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer",
					"apan JAPAÖ", "apan japan", "apan japanER", "östen"];

            var fileArray = filenames.map(function (filename) {
                var file = new File();
                file.filename = filename;
                file.folderId = folderId;
                return file;
            });

            db.transaction("rw", db.files, function (files) {
                fileArray.forEach(function (file) {
                    files.add(file);
                });

                files.where("filename").equalsIgnoreCase("apan japan").toArray(function (a) {
                    equal(a.length, 4, "There should be 4 files with that name");
                    equal(a[0].filename, "APAN JAPAN", "APAN JAPAN");
                    equal(a[1].filename, "Apan JapaN", "Apan JapaN");
                    equal(a[2].filename, "Apan Japan", "Apan Japan");
                    equal(a[3].filename, "apan japan", "apan japan");
                });
            }).catch(function (e) {
                ok(false, "Error: " + e.stack || e);
            }).finally(start);
        }).catch(function (e) {
            ok(false, e.stack || e);
            start();
        });
    });

    asyncTest("equalsIgnoreCase() 2 descending", function () {
        var folder = new Folder();
        folder.path = "/etc";
        folder.description = "Slasktratten";
        db.folders.add(folder).then(function (folderId) {
            var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster",
					"Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta",
					"apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer",
					"apan JAPAÖ", "apan japan", "apan japanER", "östen"];

            var fileArray = filenames.map(function (filename) {
                var file = new File();
                file.filename = filename;
                file.folderId = folderId;
                return file;
            });

            db.transaction("rw", db.files, function (files) {

                fileArray.forEach(function (file) {
                    files.add(file);
                });

                files
                    .where("filename").equalsIgnoreCase("apan japan")
                    .and(function (f) { return f.folderId === folderId }) // Just for fun - only look in the newly created /etc folder.
                    .reverse()
                    .toArray(function (a) {
                        equal(a.length, 4, "There should be 4 files with that name in " + folder.path);
                        equal(a[0].filename, "apan japan", "apan japan");
                        equal(a[1].filename, "Apan Japan", "Apan Japan");
                        equal(a[2].filename, "Apan JapaN", "Apan JapaN");
                        equal(a[3].filename, "APAN JAPAN", "APAN JAPAN");
                    });
            }).catch(function (e) {
                ok(false, "Error: " + e.stack || e);
                start();
            }).finally(start);
        });
    });

    asyncTest("equalsIgnoreCase() 3 (first key shorter than needle)", function () {
        db.transaction("rw", db.files, function (files, t) {
            files.clear();
            files.add({ filename: "Hello-there-", folderId: 1 });
            files.add({ filename: "hello-there-", folderId: 1 });
            files.add({ filename: "hello-there-everyone", folderId: 1 });
            files.add({ filename: "hello-there-everyone-of-you!", folderId: 1 });
            // Ascending
            files.where("filename").equalsIgnoreCase("hello-there-everyone").toArray(function (a) {
                equal(a.length, 1, "Should find one file");
                equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
            // Descending
            files.where("filename").equalsIgnoreCase("hello-there-everyone").reverse().toArray(function (a) {
                equal(a.length, 1, "Should find one file");
                equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
        }).catch(function (e) {
            ok(false, e.stack || e);
        }).finally(start);
    });

    asyncTest("startsWithIgnoreCase()", function () {
        db.transaction("r", db.folders, function (folders, t) {

            folders.count(function (count) {
                ok(true, "Number of folders in database: " + count);
                folders.where("path").startsWithIgnoreCase("/").toArray(function (a) {
                    equal(a.length, count, "Got all folder objects because all of them starts with '/'");
                });
            });

            folders.where("path").startsWithIgnoreCase("/usr").toArray(function (a) {
                equal(a.length, 6, "6 folders found: " + a.map(function (folder) { return '"' + folder.path + '"' }).join(', '));
            });

        }).then(function(){
            ok(true, "Transaction complete");
        }).catch(function(e) {
            ok(false, e.stack || e);
        }).finally(function () {
            start();
        });
    });

    asyncTest("queryingNonExistingObj", function () {
        db.files.where("filename").equals("fdsojifdsjoisdf").toArray(function (a) {
            equal(a.length, 0, "File fdsojifdsjoisdf was not found");
        }).catch(function (e) {
            ok(false, e.stack || e);
        }).finally(start);
    });

    asyncTest("compount-index", 2, function () {
        db.transaction("r", db.files, function (files) {
            files.where("[filename+extension]").equals(["README", ".TXT"]).toArray(function (a) {
                equal(a.length, 1, "Found one file by compound index search");
                equal(a[0].filename, "README", "The found file was README.TXT");
            });
        }).catch(function (e) {
            ok(false, e + ". Expected to fail on IE10/IE11 - no support compound indexs.");
        }).finally(start);
    });

    asyncTest("above, aboveOrEqual, below, belowOrEqual, between", 32, function () {
        db.folders.where('id').above(5).toArray(function (a) {
            equal(a.length, 4, "Four folders have id above 5");
            equal(a[0].path, "/usr/local/var");
            equal(a[1].path, "/USR/local/VAR");
            equal(a[2].path, "/var");
            equal(a[3].path, "/var/bin");
        }).then(function () {
            return db.folders.where('id').aboveOrEqual(5).toArray(function (a) {
                equal(a.length, 5, "Five folders have id above or equal 5");
                equal(a[0].path, "/usr/local/src");
                equal(a[1].path, "/usr/local/var");
                equal(a[2].path, "/USR/local/VAR");
                equal(a[3].path, "/var");
                equal(a[4].path, "/var/bin");
            });
        }).then(function () {
            return db.folders.where('id').below(5).toArray(function (a) {
                equal(a.length, 4, "Four folders have id below 5");
                equal(a[0].path, "/");
                equal(a[1].path, "/usr");
                equal(a[2].path, "/usr/local");
                equal(a[3].path, "/usr/local/bin");
            });
        }).then(function () {
            return db.folders.where('id').belowOrEqual(5).toArray(function (a) {
                equal(a.length, 5, "Five folders have id below or equal to 5");
                equal(a[0].path, "/");
                equal(a[1].path, "/usr");
                equal(a[2].path, "/usr/local");
                equal(a[3].path, "/usr/local/bin");
                equal(a[4].path, "/usr/local/src");
            });
        }).then(function () {
            return db.folders.where('id').between(1, 2).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2");
                equal(a[0].id, 1, "Found item is number 1");
            });
        }).then(function () {
            return db.folders.where('id').between(1, 2, true, false).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2 (including lower but not upper)");
                equal(a[0].id, 1, "Found item is number 1");
            });
        }).then(function () {
            return db.folders.where('id').between(1, 2, false, true).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2 (including upper but not lower)");
                equal(a[0].id, 2, "Found item is number 2");
            });
        }).then(function () {
            return db.folders.where('id').between(1, 2, false, false).toArray(function (a) {
                equal(a.length, 0, "Zarro folders between 1 and 2 (neither including lower nor upper)");
            });
        }).then(function () {
            return db.folders.where('id').between(1, 2, true, true).toArray(function (a) {
                equal(a.length, 2, "Two folder between 1 and 2 (including both lower and upper)");
                equal(a[0].id, 1, "Number 1 among found items");
                equal(a[1].id, 2, "Number 2 among found items");
            });
        }).catch(function (err) {
            ok(false, err.stack || err);
        }).finally(start);
    });

    /*asyncTest("empty", function () {
        db.transaction("rw", [db.files, db.folders], function (files, folders) {
            files.add({ filename: "readmeDotEmpty", extension: "", folderId: 1 });
            files.add({ filename: "readmeDotNothing", folderId: 1 });
            files.add({ filename: "readmeDotUndefined", extension: undefined, folderId: 1 });
            files.add({ filename: "readmeDotNull", extension: null, folderId: 1 });
            files.add({ filename: "readmeDotZero", extension: 0, folderId: 1 });
            files.add({ filename: "readmeDotOne", extension: 1, folderId: 1 });
            files.add({ filename: "readmeDotDate", extension: new Date(), folderId: 1 });
            files.add({ filename: "readmeDotTxt", extension: ".txt", folderId: 1 });
            files.where("extension").empty().toArray(function (a) {
                ok(a.some(function (f) { return f.filename === "readmeDotEmpty"; }), "Found readmeDotEmpty");
                ok(a.some(function (f) { return f.filename === "readmeDotNothing"; }), "Found readmeDotNothing");
                ok(a.some(function (f) { return f.filename === "readmeDotUndefined"; }), "Found readmeDotUndefined");
                ok(!a.some(function (f) { return f.filename === "readmeDotOne"; }), "Not found readmeDotOne");
                ok(!a.some(function (f) { return f.filename === "readmeDotDate"; }), "Not found readmeDotDate");
                ok(!a.some(function (f) { return f.filename === "readmeDotDate"; }), "Not found readmeDotDate");
            });
        }).catch(function(e) {
            ok(false, e);
        }).finally(function () {
            start();
        });
    });*/

})();
