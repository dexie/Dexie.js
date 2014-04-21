///<reference path="../src/Dexie.js" />

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/

var db = new Dexie("FullTextSample");

db.version(1).stores({emails: "++id,subject,from,*to,*cc,*bcc,message,*messageWords"});

// To explain the structure of an email, let's not declare it as a class (optional!)
var Email = db.emails.defineClass({
    id: Number,
    subject: String,
    from: String,
    to: [String],
    cc: [String],
    bcc: [String],
    message: String,
    messageWords: [String]
});

// Add hooks that will index "message" for full-text search:
db.emails.hook("creating", function (primKey, obj, trans) {
    if (typeof obj.message == 'string') obj.messageWords = getAllWords(obj.message);
});
db.emails.hook("updating", function (mods, primKey, obj, trans) {
    if (typeof mods.message == 'string')
        return { messageWords: getAllWords(mods.message) };
    else
        return { messageWords: []};
});
function getAllWords(text) {
    /// <param name="text" type="String"></param>
    var allWordsIncludingDups = text.split(' ');
    var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
        prev[current] = true;
        return prev;
    }, {});
    return Object.keys(set);
}

// Open database to allow application code using it.
db.open();


//
// Application code:
//

db.transaction('rw', db.emails, function (emails) {
    // Add an email:
    emails.add(new Email({
        subject: "Testing full-text search",
        from: "david@abc.com",
        to: ["test@abc.com"],
        message: "Here is my very long message that I want to write"
    }));

    // Search for emails:
    emails.where("messageWords").startsWithIgnoreCase("v").distinct().toArray(function (a) {
        alert("Found " + a.length + " emails containing a word starting with 'v'");
    });
}).catch(function (e) {
    alert(e.stack || e);
});

