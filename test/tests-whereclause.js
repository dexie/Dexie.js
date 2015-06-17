///<reference path="run-unit-tests.html" />


(function () {

    var db = new Dexie("TestDBWhereClause");
    db.version(1).stores({
        folders: "++id,&path",
        files: "++id,filename,extension,[filename+extension],folderId",
        people: "[name+number],name,number"
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

    File.prototype.getFullPath = function () {
        var file = this;
        return db.folders.get(this.folderId, function (folder) {
            return folder.path + "/" + file.filename + (file.extension || "");
        });
    }

    var firstFolderId = 0,
        lastFolderId = 0,
        firstFileId = 0,
        lastFileId = 0;

    db.on("populate", function(trans) {
        var folders = trans.table("folders");
        var files = trans.table("files");
        folders.add({path: "/", description: "Root folder"}).then(function(id) {
            firstFolderId = id;
        });
        folders.add({path: "/usr"}); // 2
        folders.add({path: "/usr/local"}); // 3
        folders.add({path: "/usr/local/bin" }).then(function (id) { // 4
            files.add({ filename: "Hello", folderId: id }).then(function(fileId) {
                firstFileId = fileId;
            });
            files.add({filename: "hello", extension: ".exe", folderId: id});
        });
        folders.add({path: "/usr/local/src"}).then(function (id) { // 5
            files.add({filename: "world", extension: ".js", folderId: id});
            files.add({filename: "README", extension: ".TXT", folderId: id});
        });
        folders.add({ path: "/usr/local/var" }); // 6
        folders.add({ path: "/USR/local/VAR" }); // 7
        folders.add({ path: "/var"}); // 8
        folders.add({ path: "/var/bin" }).then(function(id) { // 9
            lastFolderId = id;
            return files.add({ filename: "hello-there", extension: ".exe", folderId: id });
        }).then(function(id) {
            lastFileId = id;
        });
    });

    module("WhereClause", {
        setup: function () {
            stop();
            resetDatabase(db).catch(function (e) {
                ok(false, "Error resetting database: " + e);
            }).finally(start);
        },
        teardown: function () {
        }
    });

    asyncTest("startsWithAnyOf()", function () {

        function runTheTests (mippler) {
            /// <param name="mippler" value="function(x){return x;}"></param>

            //
            // Basic Flow:
            //
            return mippler(db.folders
                .where('path').startsWithAnyOf('/usr/local', '/var'))
                .toArray(function (result) {
                    equal(result.length, 6, "Query should match 6 folders");
                    ok(result.some(function(x) { return x.path == '/usr/local'; }), '/usr/local');
                    ok(result.some(function(x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
                    ok(result.some(function (x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
                    ok(result.some(function (x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
                    ok(result.some(function (x) { return x.path == '/var'; }), '/var');
                    ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');

                    //
                    // Require a slash at beginning (and use an array of strings as argument instead)
                    //
                    return mippler(db.folders
                        .where('path').startsWithAnyOf(['/usr/local/', '/var/']))
                        .toArray();

                }).then(function(result) {
                    equal(result.length, 4, "Query should match 4 folders");
                    ok(result.some(function(x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
                    ok(result.some(function(x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
                    ok(result.some(function(x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
                    ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');

                    //
                    // Some specialities
                    //
                    return Dexie.Promise.all(
                        mippler(db.folders.where('path').startsWithAnyOf([])).count(), // Empty
                        mippler(db.folders.where('path').startsWithAnyOf('/var', '/var', '/var')).count(), // Duplicates
                        mippler(db.folders.where('path').startsWithAnyOf('')).count(), // Empty string should match all
                        mippler(db.folders).count(),
                        mippler(db.folders.where('path').startsWithAnyOf('nonexisting')).count() // Non-existing match
                    );
                }).then(function(results) {
                    equal(results[0], 0, "startsWithAnyOf([]).count() == 0");
                    equal(results[1], 2, "startsWithAnyOf('/var', '/var', '/var') == 2");
                    equal(results[2], results[3], "startsWithAnyOf('').count() == db.folders.count()");
                    equal(results[4], 0, "startsWithAnyOf('nonexisting').count() == 0");

                    //
                    // Error handling
                    //

                    return mippler(db.folders.where('path').startsWithAnyOf([null, '/'])).toArray(function(res) {
                        ok(false, "Should not succeed to have null in parameter");
                    }).catch(function(e) {
                        ok(true, "As expected: failed to have null in arguments: " + e);
                    });
                });
        }

        // Run tests without transaction and without reverse()
        runTheTests(function (x) { return x; }).then(function () {
            ok(true, "FINISHED NORMAL TEST!");
            // Run tests with reverse()
            return runTheTests(function(x) { return x.reverse(); });
        }).then(function() {
            ok(true, "FINISHED REVERSE TEST!");
            // Run tests within a transaction
            return db.transaction('r', db.folders, db.files, function() {
                return runTheTests(function(x) { return x; });
            });
        }).then(function () {
            ok(true, "FINISHED TRANSACTION TEST!");
        }).catch(function (e) {
            ok(false, "Error: " + e);
        }).finally(start);
    });

    asyncTest("anyOf()", function () {
        db.transaction("r", db.files, db.folders, function () {

            db.files.where("filename").anyOf("hello", "hello-there", "README", "gösta").toArray(function (a) {
                equal(a.length, 3, "Should find 3 files");
                equal(a[0].filename, "README", "First match is README because capital R comes before lower 'h' in lexical sort");
                equal(a[1].filename, "hello", "Second match is hello");
                equal(a[2].filename, "hello-there", "Third match is hello-there");

                a[0].getFullPath().then(function (fullPath) {
                    equal(fullPath, "/usr/local/src/README.TXT", "Full path of README.TXT is: " + fullPath);
                });
                a[1].getFullPath().then(function (fullPath) {
                    equal(fullPath, "/usr/local/bin/hello.exe", "Full path of hello.exe is: " + fullPath);
                });
                a[2].getFullPath().then(function (fullPath) {
                    equal("/var/bin/hello-there.exe", fullPath, "Full path of hello-there.exe is: " + fullPath);
                });
            });

        }).catch(function (e) {
            ok(false, "Error: " + e.stack || e);
        }).finally(start);
    });

    asyncTest("anyOf(integerArray)", function () {
        // Testing bug #11 Integer Indexes in anyOf handled incorrectly
        db.files.put({ id: 9000, filename: "new file 1", folderId: firstFolderId });
        db.files.put({ id: 10000, filename: "new file 2", folderId: firstFolderId });
        db.files.where('id').anyOf([9000, 11000]).toArray(function (a) {
            equal(a.length, 1, "Should be only one found entry");
            equal(a[0].id, 9000, "Item no 9000 should be found");
        }).finally(start);
    });

    asyncTest("anyOf(emptyArray)", function () {
        db.files.where('id').anyOf([]).toArray(function (a) {
            equal(a.length, 0, "Should be empty");
        }).catch(function (e) {
            ok(false, "Error: " + e.stack || e);
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

            db.transaction("rw", db.files, function () {
                fileArray.forEach(function (file) {
                    db.files.add(file);
                });

                db.files.where("filename").equalsIgnoreCase("apan japan").toArray(function (a) {
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

            db.transaction("rw", db.files, function () {

                fileArray.forEach(function (file) {
                    db.files.add(file);
                });

                db.files
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
        if (typeof idbModules !== 'undefined' && Dexie.dependencies.indexedDB === idbModules.shimIndexedDB) {
            // Using indexedDBShim.
            ok(false, "This test would hang with IndexedDBShim as of 2015-05-07");
            start();
            return;
        }
        db.transaction("rw", db.files, function () {
            db.files.clear();
            db.files.add({ filename: "Hello-there-", folderId: 1 });
            db.files.add({ filename: "hello-there-", folderId: 1 });
            db.files.add({ filename: "hello-there-everyone", folderId: 1 });
            db.files.add({ filename: "hello-there-everyone-of-you!", folderId: 1 });
            // Ascending
            db.files.where("filename").equalsIgnoreCase("hello-there-everyone").toArray(function (a) {
                equal(a.length, 1, "Should find one file");
                equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
            // Descending
            db.files.where("filename").equalsIgnoreCase("hello-there-everyone").reverse().toArray(function (a) {
                equal(a.length, 1, "Should find one file");
                equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
        }).catch(function (e) {
            ok(false, e.stack || e);
        }).finally(start);
    });

    asyncTest("startsWithIgnoreCase()", function () {
        db.transaction("r", db.folders, function () {

            db.folders.count(function (count) {
                ok(true, "Number of folders in database: " + count);
                db.folders.where("path").startsWithIgnoreCase("/").toArray(function (a) {
                    equal(a.length, count, "Got all folder objects because all of them starts with '/'");
                });
            });

            db.folders.where("path").startsWithIgnoreCase("/usr").toArray(function (a) {
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
        db.transaction("r", db.files, function () {
            db.files.where("[filename+extension]").equals(["README", ".TXT"]).toArray(function (a) {
                equal(a.length, 1, "Found one file by compound index search");
                equal(a[0].filename, "README", "The found file was README.TXT");
            });
        }).catch(function (e) {
            ok(false, e + ". Expected to fail on IE10/IE11 - no support compound indexs.");
        }).finally(start);
    });

    asyncTest("compound-primkey (Issue #37)", function() {
        db.transaction('rw', db.people, function() {
            db.people.add({ name: "Santaclaus", number: 123 });
            db.people.add({ name: "Santaclaus", number: 124 });
            db.people.add({ name: "Santaclaus2", number: 1 });
            return db.people.get(["Santaclaus", 123]);
        }).then(function(santa) {
            ok(!!santa, "Got santa");
            equal(santa.name, "Santaclaus", "Santa's name is correct");
            equal(santa.number, 123, "Santa's number is correct");

            return db.people.where("[name+number]").between(["Santaclaus", 1], ["Santaclaus", 200]).toArray();
        }).then(function(santas) {
            equal(santas.length, 2, "Got two santas");
        }).catch(function (e) {
            ok(false, "Failed (will fail in IE without polyfill):" + e);
        }).finally(start);
    });

    asyncTest("Issue #31 - Compound Index with anyOf", function() {
        db.files
            .where("[filename+extension]")
            .anyOf([["hello", ".exe"], ["README", ".TXT"]])
            .toArray(function (a) {
                equal(a.length, 2, "Should find two files");
                equal(a[0].filename, "README", "First comes the uppercase README.TXT");
                equal(a[1].filename, "hello", "Second comes the lowercase hello.exe");

            }).catch(function(e) {
                ok(false, "Failed (will fail in IE without polyfill):" + e);
            }).finally(start);
    });

    asyncTest("above, aboveOrEqual, below, belowOrEqual, between", 32, function () {
        db.folders.where('id').above(firstFolderId + 4).toArray(function (a) {
            equal(a.length, 4, "Four folders have id above 5");
            equal(a[0].path, "/usr/local/var");
            equal(a[1].path, "/USR/local/VAR");
            equal(a[2].path, "/var");
            equal(a[3].path, "/var/bin");
        }).then(function () {
            return db.folders.where('id').aboveOrEqual(firstFolderId + 4).toArray(function (a) {
                equal(a.length, 5, "Five folders have id above or equal 5");
                equal(a[0].path, "/usr/local/src");
                equal(a[1].path, "/usr/local/var");
                equal(a[2].path, "/USR/local/VAR");
                equal(a[3].path, "/var");
                equal(a[4].path, "/var/bin");
            });
        }).then(function () {
            return db.folders.where('id').below(firstFolderId + 4).toArray(function (a) {
                equal(a.length, 4, "Four folders have id below 5");
                equal(a[0].path, "/");
                equal(a[1].path, "/usr");
                equal(a[2].path, "/usr/local");
                equal(a[3].path, "/usr/local/bin");
            });
        }).then(function () {
            return db.folders.where('id').belowOrEqual(firstFolderId + 4).toArray(function (a) {
                equal(a.length, 5, "Five folders have id below or equal to 5");
                equal(a[0].path, "/");
                equal(a[1].path, "/usr");
                equal(a[2].path, "/usr/local");
                equal(a[3].path, "/usr/local/bin");
                equal(a[4].path, "/usr/local/src");
            });
        }).then(function () {
            return db.folders.where('id').between(firstFolderId, firstFolderId + 1).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2");
                equal(a[0].id, firstFolderId, "Found item is number 1");
            });
        }).then(function () {
            return db.folders.where('id').between(firstFolderId, firstFolderId + 1, true, false).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2 (including lower but not upper)");
                equal(a[0].id, firstFolderId, "Found item is number 1");
            });
        }).then(function () {
            return db.folders.where('id').between(firstFolderId, firstFolderId + 1, false, true).toArray(function (a) {
                equal(a.length, 1, "One folder between 1 and 2 (including upper but not lower)");
                equal(a[0].id, firstFolderId + 1, "Found item is number 2");
            });
        }).then(function () {
            return db.folders.where('id').between(firstFolderId, firstFolderId + 1, false, false).toArray(function (a) {
                equal(a.length, 0, "Zarro folders between 1 and 2 (neither including lower nor upper)");
            });
        }).then(function () {
            return db.folders.where('id').between(firstFolderId, firstFolderId + 1, true, true).toArray(function (a) {
                equal(a.length, 2, "Two folder between 1 and 2 (including both lower and upper)");
                equal(a[0].id, firstFolderId, "Number 1 among found items");
                equal(a[1].id, firstFolderId + 1, "Number 2 among found items");
            });
        }).catch(function (err) {
            ok(false, err.stack || err);
        }).finally(start);
    });

    asyncTest("notEqual", function () {
        db.folders.where('path').notEqual("/usr/local").sortBy("path", function (result) {
            result = result.map(function(x) { return x.path; });
            equal(JSON.stringify(result,null,4), JSON.stringify([
                "/",
                "/USR/local/VAR",
                "/usr",
                //"/usr/local"
                "/usr/local/bin",
                "/usr/local/src",
                "/usr/local/var",
                "/var",
                "/var/bin"
            ],null,4), "/usr/local should be removed");
        }).catch(function (err) {
            ok(false, err.stack || err);
        }).finally(start);
    });

    asyncTest("noneOf", function () {
        db.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").sortBy("path", function (result) {
            result = result.map(function (x) { return x.path; });
            equal(JSON.stringify(result, null, 4), JSON.stringify([
                //"/",
                "/USR/local/VAR",
                "/usr",
                //"/usr/local"
                "/usr/local/bin",
                "/usr/local/src",
                "/usr/local/var",
                "/var",
                //"/var/bin"
            ], null, 4), "Only items not specified in query should come into result");
        }).catch(function (err) {
            ok(false, err.stack || err);
        }).finally(start);
    });

    asyncTest("noneOf keys", function () {
        db.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").keys(function (result) {
            result = result.sort(function(a, b) { return a < b ? -1 : a === b ? 0 : 1; });
            equal(JSON.stringify(result, null, 4), JSON.stringify([
                //"/",
                "/USR/local/VAR",
                "/usr",
                //"/usr/local"
                "/usr/local/bin",
                "/usr/local/src",
                "/usr/local/var",
                "/var",
                //"/var/bin"
            ], null, 4), "Only keys not specified in query should come into result");
        }).catch(function (err) {
            ok(false, err.stack || err);
        }).finally(start);
    });

})();
