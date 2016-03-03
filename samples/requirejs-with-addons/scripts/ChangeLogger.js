
define(['./db', './console'], function (db, console) {

    function ChangeLogger() {
        db.on('changes', function(changes) {
            console.log("Changes: " + JSON.stringify(changes, null, 4));
        });
    }
    
    return ChangeLogger;
});
