
export class ImageTracker {
    private images: HTMLImageElement[] = [];
    private names: string[] = [];
    private loadCount: number = 0;
    private started: boolean = false;
    private readyCallback: () => void;

    constructor(readyCallback: () => void) {
        this.readyCallback = readyCallback;
    }

    public request(name: string): HTMLImageElement {
        let image = new Image();
        this.images.push(image);
        this.names.push(name);
        return image;
    }

    public start() {
        if (this.started) {
            throw "cannot call start method twice";
        }
        this.started = true;
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].onload = (() => this.loaded());
            this.images[i].src = this.names[i];
        }
    }

    public isReady(): boolean {
        return this.started && (this.loadCount == this.images.length);
    }

    private loaded() {
        this.loadCount ++;
        if (this.isReady()) {
            this.readyCallback();
        }
    }
}

