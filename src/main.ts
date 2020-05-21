
class DrawingApp {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean;

    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];

    private image: HTMLImageElement;

    private tileX: number[] = [];
    private tileY: number[] = [];

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

        this.redraw();
        this.createUserEvents();
        this.initTileXY();
    }

    private gridSize = 6;
    private borderSize = 0;
    private tileSize = 310;

    private getTileX(tileId: number, tileWidth: number,
                     leftX: number, rightX: number): number {
       
        let allWidth = rightX - leftX;
        let allTileWidth = tileWidth * this.gridSize;
        let allGapWidth = allWidth - allTileWidth;
        let gapWidth = allGapWidth / (this.gridSize - 1);

        return Math.floor(leftX + this.borderSize + (tileWidth + gapWidth) * tileId);
    }

    private initTileXY() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let bottomRightX = 2253;
                let bottomRightY = 2297;
                let topLeftX = 53;
                let topLeftY = 61;
                let x1 = this.getTileX(x, this.tileSize, topLeftX, bottomRightX);
                let y1 = this.getTileX(y, this.tileSize, topLeftY, bottomRightY);
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

        document.getElementById('clear')
                .addEventListener("click", this.clearEventHandler);
    }

    private redraw() {
        let context = this.context;

        //context.beginPath();
        context.fillStyle = 'blue';
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                let i = (y * 6) + x;
                context.drawImage(this.image,
                                  this.tileX[i], this.tileY[i],
                                  this.tileSize, this.tileSize,
                                  50 + (x * 100), 50 + (y * 100),
                                  90, 90);
            }
        }
        //context.clip();
        //context.closePath();
    }

    private addClick(x: number, y: number, dragging: boolean) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
    }

    private clearCanvas() {
        this.context
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
    }

    private clearEventHandler = () => {
        this.clearCanvas();
    }

    private releaseEventHandler = () => {
        this.paint = false;
        this.redraw();
    }

    private cancelEventHandler = () => {
        this.paint = false;
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        this.paint = true;
        this.addClick(mouseX, mouseY, false);
        this.redraw();
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        if (this.paint) {
            this.addClick(mouseX, mouseY, true);
            this.redraw();
        }

        e.preventDefault();
    }


}

new DrawingApp();
