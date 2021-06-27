
onmessage = function (e) {
    var imports = e.data.imports || [];
    var code = e.data.code;
    if (imports.length > 0)
        importScripts.apply(self, imports);

    var pCodeBegin = code.indexOf('{'),
        pCodeEnd = code.lastIndexOf('}');
    if (pCodeBegin === -1 || pCodeEnd === -1) {
        postMessage(["ok", false, "Worker.js error: Provided code must be (a Function).toString()"]);
        postMessage(["done"]);
        return;
    }
    try {
        code = code.substring(pCodeBegin + 1, pCodeEnd);
        new Function("ok", "done", code)(function ok(b, msg) {
            postMessage(["ok", b, msg]);
        }, function() {
            postMessage(["done"]);
        });
    } catch (ex) {
        postMessage(["ok", false, "Worker error: " + ex.toString() + (ex.stack ? "\n" + ex.stack : "")]);
        postMessage(["done"]);
        return;
    }
}
