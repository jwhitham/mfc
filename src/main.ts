
class DrawingApp {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private image: HTMLImageElement;

    private tileX: number[] = [];
    private tileY: number[] = [];

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
        this.initTileXY();
        this.redraw();
    }

    private origGridSize = 6;
    private origBorderSize = 0;
    private origTileSize = 310;

    private getTileX(tileId: number, tileWidth: number,
                     leftX: number, rightX: number): number {
       
        let allWidth = rightX - leftX;
        let allTileWidth = tileWidth * this.origGridSize;
        let allGapWidth = allWidth - allTileWidth;
        let gapWidth = allGapWidth / (this.origGridSize - 1);

        return Math.floor(leftX + this.origBorderSize + (tileWidth + gapWidth) * tileId);
    }

    private initTileXY() {
        let bottomRightX = 2253;
        let bottomRightY = 2297;
        let topLeftX = 53;
        let topLeftY = 61;
        for (let y = 0; y < this.origGridSize; y++) {
            for (let x = 0; x < this.origGridSize; x++) {
                let x1 = this.getTileX(x, this.origTileSize, topLeftX, bottomRightX);
                let y1 = this.getTileX(y, this.origTileSize, topLeftY, bottomRightY);
                this.tileX.push(x1);
                this.tileY.push(y1);
            }
        }
    }


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
                    let i = (y * 6) + x;
                    context.drawImage(this.image,
                                      this.tileX[i], this.tileY[i],
                                      this.origTileSize, this.origTileSize,
                                      (x * tileBorderSize) + this.borderSize,
                                      (y * tileBorderSize) + this.borderSize,
                                      this.tileSize, this.tileSize);
                }
            }
        } else {
            let i = this.mouseTile;
            context.drawImage(this.image,
                              this.tileX[i], this.tileY[i],
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
            t += this.tileX[i];
            t += ",";
            t += this.tileY[i];
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
            let i = this.mouseTile;
            this.tileX[i] -= dx;
            this.tileY[i] -= dy;
            if (this.tileX[i] < 0) { this.tileX[i] = 0; }
            if (this.tileY[i] < 0) { this.tileY[i] = 0; }
            if (this.tileX[i] >= (this.image.width - this.origTileSize)) {
                this.tileX[i] = this.image.width - this.origTileSize - 1;
            }
            if (this.tileY[i] >= (this.image.height - this.origTileSize)) {
                this.tileY[i] = this.image.height - this.origTileSize - 1;
            }
            this.mouseDownXY = mouseDragXY;
            this.redraw();
        }

        e.preventDefault();
    }


}

new DrawingApp();
