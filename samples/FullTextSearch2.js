///<reference path="../src/Dexie.js" />

/*
    This example is an implementation of full-text search based hook ("creating") and hook("updating").
    This example does not use multi-valued indexes which makes it work with all indexedDB implementations.
*/

var db = new Dexie("FullTextSample");

db.version(1).stores({
    emails: "++id,subject,from,to,cc,bcc,message",
    emailWords: "++,word,emailId" // This object store is a "view". It will contain mappings between all words to corresponding emails.
});

db._createTransaction = Dexie.override(db._createTransaction, function (createTransaction) {
    // Override db._createTransaction() to make sure to add emailWords table to any transaction being modified
    // If not doing this, error will occur in the hooks unless the application code has included emailWords in the transaction when modifying emails table.
    return function(mode, storeNames, dbSchema) {
        if (mode === "readwrite" && storeNames.indexOf("emailWords") == -1) {
            storeNames.push("emailWords");
        }
        return createTransaction.apply(this, arguments);
    }
});

db.emails.hook("creating", function (primKey, obj, trans) {
    // Must wait till we have the auto-incremented key.
    trans._lock(); // Lock transaction until we got primary key and added all mappings. App code trying to read from emailWords the line after having added an email must then wait until we are done writing the mappings.
    this.onsuccess = function (primKey) {
        /// <param name="trans" type="db.Transaction"></param>
        var emailWords = trans.table("emailWords");
        // Add mappings for all words.
        getAllWords(obj.message).forEach(function (word) {
            emailWords.add({ word: word, emailId: primKey });
        });
        trans._unlock();
    }
    this.onerror = function () {
        trans._unlock();
    }
});

db.emails.hook("updating", function (mods, primKey, obj, trans) {
    /// <param name="trans" type="db.Transaction"></param>
    if (mods.hasOwnProperty("message")) {
        // message property is about to be changed.
        // Delete existing mappings
        var emailWords = trans.table("emailWords");
        emailWords.where("emailId").equals(primKey).delete();
        // Add new mappings.
        if (mods.message) {
            getAllWords(mods.message).forEach(function (word) {
                emailWords.add({ word: word, emailId: primKey });
            });
        }
    }
});

db.emails.hook("deleting", function (primKey, obj, trans) {
    /// <param name="trans" type="db.Transaction"></param>
    if (obj.message) {
        // Email is about to be deleted.
        // Delete existing mappings
        trans.table("emailWords").where("emailId").equals(primKey).delete();
    }
});


function getAllWords(text) {
    /// <param name="text" type="String"></param>
    if (text) {
        var allWordsIncludingDups = text.toLowerCase().split(' ');
        var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
            prev[current] = true;
            return prev;
        }, {});
        return Object.keys(set);
    }
}

// Open database to allow application code using it.
db.open();

//
// Application code:
//

db.transaction('rw', db.emails, db.emailWords, function (emails, emailWords) {
    // Add an email:
    emails.add({
        subject: "Testing full-text search",
        from: "david@abc.com",
        to: ["test@abc.com"],
        message: "Here is my very long message that I want to write"
    });

    // Search for emails:
    var foundIds = {};
    emailWords.where("word").startsWith("v").each(function (wordToEmailMapping) {
        foundIds[wordToEmailMapping.emailId.toString()] = true;
    }).then(function () {
        // Now we got all email IDs in the keys of foundIds object.
        // Convert to array if IDs.
        var emailIds = Object.keys(foundIds).map(function (idStr) { return parseInt(idStr); });
        alert("Found " + emailIds.length + " emails containing a word starting with 'v'");
        // Now query all items from the array:
        emails.where("id").anyOf(emailIds).each(function (email) {
            alert ("Found email:  "  + JSON.stringify(email));
        });
    });
}).catch(function (e) {
    alert(e.stack || e);
});

