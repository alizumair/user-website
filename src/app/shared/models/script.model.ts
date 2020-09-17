

export class ScriptModel {
    id: string;
    src: string;
    text?: string;
    isLoaded: boolean;

    constructor(id: string, src: string, text?: string) {
        this.id = id;
        this.src = src;
        if (text) {
            this.text = text;
        }
        this.isLoaded = false;
    }
} 
