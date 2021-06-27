define(function () {

    function Console() {
        this.textarea = document.createElement('textarea');
        this.log = function (txt, type) {
            if (type) this.textarea.value += type + " ";
            this.textarea.value += txt + "\n";
        }
        this.error = function (txt) {
            this.log(txt, "ERROR!");
        }
    }

    var console = new Console();

    document.getElementById('consoleArea').appendChild(console.textarea);

    return console;
});
