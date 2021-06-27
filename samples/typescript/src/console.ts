export default class Console {
    textarea: HTMLTextAreaElement;

    constructor() {
        this.textarea = document.createElement('textarea');
    }

    log(txt: string, type?: string) {
        if (type) this.textarea.value += type + " ";
        this.textarea.value += txt + "\n";
    }
    error = function(txt: string) {
        this.log(txt, "ERROR!");
    }
}
