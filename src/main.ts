
class DrawingApp {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private image: HTMLImageElement;

    private tileXY: number[] = 
           [49,61,423,55,789,54,1211,61,1579,62,1943,62,52,430,423,427,795,423,1216,429,1581,
            429,1952,430,52,843,423,846,795,842,1210,842,1580,841,1943,844,48,1217,423,1219,
            796,1217,1208,1212,1581,1213,1944,1215,56,1641,421,1637,794,1636,1211,1630,1581,
            1633,1940,1627,55,2004,427,2009,794,2004,1215,2002,1582,2000,1945,1994];

    private mouseDownXY: number[] = [];
    private mouseTile: number = -1;

    constructor() {
        let canvas = document.getElementById('canvas') as
                     HTMLCanvasElement;
        let context = canvas.getContext("2d");
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;
        this.image = new Image();
        this.image.src = "mfc_tiles.jpg";

        this.createUserEvents();
        this.redraw();
    }

    private origGridSize = 6;
    private origTileSize = 310;

    private createUserEvents() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("mousemove", this.dragEventHandler);
        canvas.addEventListener("mouseup", this.releaseEventHandler);
        canvas.addEventListener("mouseout", this.cancelEventHandler);

        canvas.addEventListener("touchstart", this.pressEventHandler);
        canvas.addEventListener("touchmove", this.dragEventHandler);
        canvas.addEventListener("touchend", this.releaseEventHandler);
        canvas.addEventListener("touchcancel", this.cancelEventHandler);

    }

    private borderSize = 10;
    private tileSize = 90;

    private redraw() {
        let context = this.context;

        //context.beginPath();
        context.fillStyle = 'white';

        let tileBorderSize = this.borderSize + this.tileSize;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.mouseTile < 0) {
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 6; x++) {
                    let i = ((y * 6) + x) * 2;
                    context.drawImage(this.image,
                                      this.tileXY[i], this.tileXY[i + 1],
                                      this.origTileSize, this.origTileSize,
                                      (x * tileBorderSize) + this.borderSize,
                                      (y * tileBorderSize) + this.borderSize,
                                      this.tileSize, this.tileSize);
                }
            }
        } else {
            let i = this.mouseTile * 2;
            context.drawImage(this.image,
                              this.tileXY[i], this.tileXY[i + 1],
                              this.origTileSize, this.origTileSize,
                              this.borderSize, this.borderSize,
                              this.origGridSize * tileBorderSize, this.origGridSize * tileBorderSize);
        }
        //context.clip();
        //context.closePath();
    }

    private releaseEventHandler = () => {
        this.mouseTile = -1;
        this.redraw();

        let t = "[";
        for (let i = 0; i < (this.origGridSize * this.origGridSize); i++) {
            t += this.tileXY[i * 2];
            t += ",";
            t += this.tileXY[(i * 2) + 1];
            t += ",";
        }
        t += "0]";

        let text = document.getElementById('text') as
                     HTMLElement;
        text.innerHTML = t;
    }

    private cancelEventHandler = () => {
        this.mouseTile = -1;
    }

    private getMouseXY(e: MouseEvent | TouchEvent): number[] {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        return [mouseX, mouseY];
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        this.mouseDownXY = this.getMouseXY(e);
        let x = this.mouseDownXY[0];
        let y = this.mouseDownXY[1];
        let tileBorderSize = this.borderSize + this.tileSize;
        x = Math.floor(x / tileBorderSize);
        y = Math.floor(y / tileBorderSize);
        if ((x >= 0) && (x < this.origGridSize) && (y >= 0) && (y < this.origGridSize)) {
            this.mouseTile = x + (y * this.origGridSize);
        } else {
            this.mouseTile = -1;
        }
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        if (this.mouseTile >= 0) {
            let mouseDragXY = this.getMouseXY(e);
            let dx = mouseDragXY[0] - this.mouseDownXY[0];
            let dy = mouseDragXY[1] - this.mouseDownXY[1];
            let i = this.mouseTile * 2;
            this.tileXY[i] -= dx;
            this.tileXY[i + 1] -= dy;
            if (this.tileXY[i] < 0) { this.tileXY[i] = 0; }
            if (this.tileXY[i + 1] < 0) { this.tileXY[i + 1] = 0; }
            if (this.tileXY[i] >= (this.image.width - this.origTileSize)) {
                this.tileXY[i] = this.image.width - this.origTileSize - 1;
            }
            if (this.tileXY[i + 1] >= (this.image.height - this.origTileSize)) {
                this.tileXY[i + 1] = this.image.height - this.origTileSize - 1;
            }
            this.mouseDownXY = mouseDragXY;
            this.redraw();
        }

        e.preventDefault();
    }


}

new DrawingApp();
