
class GridXY {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class ScreenXY {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class ImageXY {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}


class Tile {
    public pos: GridXY | null = null;
    public rotation: number = 0;
    private imageXY: ImageXY;
    private imageTileSize: number = 0;
    private image: HTMLImageElement;

    constructor(image: HTMLImageElement,
                imageXY: ImageXY, imageTileSize: number) {
        this.image = image;
        this.imageXY = imageXY;
        this.imageTileSize = imageTileSize;
    }

    public draw(context: CanvasRenderingContext2D,
                destXY: ScreenXY,
                drawTileSize: number) {

        let half = drawTileSize * 0.5;
        context.save();
        context.translate(destXY.x + half, destXY.y + half);
        if (this.rotation) {
            context.rotate(this.rotation * Math.PI * 0.5);
        }
        context.drawImage(this.image,
                          this.imageXY.x, this.imageXY.y,
                          this.imageTileSize, this.imageTileSize,
                          -half, -half, drawTileSize, drawTileSize);
        context.restore();
    }
}

class TileSet {
    private image: HTMLImageElement;    // "mfc_tiles.jpg"
    private gridSize = 6;               // "mfc_tiles.jpg" is a 6x6 grid
    private tileSize = 310;             // each tile is roughly 310x310 pixels
    // location of top left corner of each of the 36 tiles in "mfc_tiles.jpg":
    private tileXY: number[] = 
           [49,61,423,55,789,54,1211,61,1579,62,1943,62,52,430,423,427,795,423,1216,429,1581,
            429,1952,430,52,843,423,846,795,842,1210,842,1580,841,1943,844,48,1217,423,1219,
            796,1217,1208,1212,1581,1213,1944,1215,56,1641,421,1637,794,1636,1211,1630,1581,
            1633,1940,1627,55,2004,427,2009,794,2004,1215,2002,1582,2000,1945,1994];

    constructor() {
        this.image = new Image();
        this.image.src = "mfc_tiles.jpg";
    }

    public getInitialTiles(): Tile[] {
        let allTiles: Tile[] = [];
        for (let i = 0; i < (this.gridSize * this.gridSize); i++) {
            allTiles.push(new Tile(this.image,
                                   new ImageXY(this.tileXY[i * 2], this.tileXY[(i * 2) + 1]),
                                   this.tileSize));
        }
        return allTiles;
    }
}

enum TurnState {
    AWAIT_MY_TURN,
    PLACE_THE_TILE,
    ROTATE_THE_TILE,
    END_OF_GAME,
};

class GameState {
    private placed: Tile[] = [];
    private unplaced: Tile[] = [];

    constructor(tileSet: TileSet) {
        this.unplaced = tileSet.getInitialTiles();
        // shuffle...!
    }

    public getPlacedTiles(): Tile[] {
        return this.placed;
    }

    public getCurrentTile(): Tile | null {

        if (this.unplaced.length) {
            return this.unplaced[this.unplaced.length - 1];
        } else {
            return null;
        }
    }

    public nextTile() {
        let tile = this.getCurrentTile();
        if (tile) {
            this.unplaced.pop();
            this.placed.push(tile);
        }
    }

    public getTileAt(pos: GridXY): Tile | null {
        let placed = this.placed;
        let tile = this.getCurrentTile();
        if (tile && tile.pos && (tile.pos.x == pos.x) && (tile.pos.y == pos.y)) {
            return tile;
        }
        for (let i = 0; i < placed.length; i++) {
            tile = placed[i];
            if ((tile.pos.x == pos.x) && (tile.pos.y == pos.y)) {
                return tile;
            }
        }

        return null;
    }

    public isValidPlacement(pos: GridXY): boolean {
        let placed = this.placed;
        let nextTo = false;
        if (this.getCurrentTile() == null) {
            return false; // no tile to place
        }
        if (placed.length == 0) {
            // valid to place in 0, 0
            return (pos.x == 0) && (pos.y == 0);
        }
        for (let i = 0; i < placed.length; i++) {
            let tile: Tile = placed[i];
            if (tile.pos.x == pos.x) {
                if (tile.pos.y == pos.y) {
                    return false; // tile already placed there
                } else if (tile.pos.y == (pos.y - 1)) {
                    nextTo = true;
                } else if (tile.pos.y == (pos.y + 1)) {
                    nextTo = true;
                }
            } else if (tile.pos.y == pos.y) {
                if (tile.pos.x == (pos.x - 1)) {
                    nextTo = true;
                } else if (tile.pos.x == (pos.x + 1)) {
                    nextTo = true;
                }
            }
        }
        return nextTo;
    }
}

class GameView {
    private gameState: GameState = null;
    private min: GridXY;
    private max: GridXY;
    private drawTileSize: number;
    private origin: ScreenXY;
    private size: ScreenXY;
    public background: string = "brown";

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.computeBounds();
        this.computeScale(100.0, 100.0);
    }
    
    public computeBounds() {
        let placed = this.gameState.getPlacedTiles();
        this.min = new GridXY(-3, -3);
        this.max = new GridXY(3, 3);
        for (let i = 0; i < placed.length; i++) {
            let tile: Tile = placed[i];
            if (tile.pos) {
                this.min.x = Math.min(this.min.x, tile.pos.x - 1);
                this.min.y = Math.min(this.min.y, tile.pos.y - 1);
                this.max.x = Math.max(this.max.x, tile.pos.x + 1);
                this.max.y = Math.max(this.max.y, tile.pos.y + 1);
            }
        }
    }

    public computeScale(width: number, height: number) {

        this.size = new ScreenXY(width, height);
        let gridWidth = 1 + this.max.x - this.min.x;
        let gridHeight = 1 + this.max.y - this.min.y;
        let fitX = (width * 0.98) / gridWidth;
        let fitY = (height * 0.98) / gridHeight;
        this.drawTileSize = Math.max(Math.min(fitX, fitY), 1.0);
        this.origin = new ScreenXY((width * 0.5) - (this.drawTileSize * 0.5),
                                   (height * 0.5) - (this.drawTileSize * 0.5));
    }

    public getScreenXY(pos: GridXY) : ScreenXY {
        return new ScreenXY(this.origin.x + (this.drawTileSize * pos.x),
                            this.origin.y + (this.drawTileSize * pos.y));
    }

    public drawTile(context: CanvasRenderingContext2D, tile: Tile) {
        let xy = this.getScreenXY(tile.pos);
        tile.draw(context, xy, this.drawTileSize);
    }

    public drawAll(context: CanvasRenderingContext2D) {
        let placed = this.gameState.getPlacedTiles();
        context.fillStyle = this.background;
        context.fillRect(0, 0, this.size.x, this.size.y);
        for (let i = 0; i < placed.length; i++) {
            this.drawTile(context, placed[i]);
        }
    }

    public drawAt(context: CanvasRenderingContext2D, pos: GridXY) {
        let tile = this.gameState.getTileAt(pos);
        if (tile) {
            this.drawTile(context, tile);
        } else {
            let xy = this.getScreenXY(pos);
            context.fillStyle = this.background;
            context.fillRect(xy.x, xy.y, this.drawTileSize, this.drawTileSize);
        }
    }

    public drawHighlight(context: CanvasRenderingContext2D, pos: GridXY) {
        this.drawAt(context, pos);
        let xy = this.getScreenXY(pos);
        let hPad = 5;
        let sPad = hPad * 2;
        context.strokeRect(xy.x + hPad, xy.y + hPad,
                           this.drawTileSize - sPad, this.drawTileSize - sPad);
    }

    public getGridXY(mouseX, mouseY: number): GridXY {
        return new GridXY(Math.floor((mouseX - this.origin.x) / this.drawTileSize),
                          Math.floor((mouseY - this.origin.y) / this.drawTileSize));

    }
}

class DrawingApp {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tileSet: TileSet;
    private gameState: GameState;
    private gameView: GameView;
    private turnState: TurnState = TurnState.PLACE_THE_TILE;
    private undrawPos: GridXY | null = null;


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
        this.tileSet = new TileSet();
        this.gameState = new GameState(this.tileSet);
        this.gameView = new GameView(this.gameState);
        this.gameState.getCurrentTile().pos = new GridXY(0, 0);
        this.gameState.nextTile();
        this.createUserEvents();
        this.redraw();
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

        window.addEventListener("resize", this.redraw, false);
    }

    private redraw() {
        let context = this.context;
        let canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gameView.computeScale(canvas.width, canvas.height);
        this.gameView.drawAll(context);
        this.undrawPos = null;
    }

    private releaseEventHandler = () => {
    }

    private cancelEventHandler = () => {
    }

    private getMousePos(e: MouseEvent | TouchEvent): GridXY {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        return this.gameView.getGridXY(mouseX, mouseY);
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        let pos = this.getMousePos(e);
        let tile = this.gameState.getCurrentTile();
        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && this.gameState.isValidPlacement(pos)) {
                    tile.pos = pos;
                    this.gameView.drawTile(this.context, tile);
                    this.turnState = TurnState.ROTATE_THE_TILE;
                }
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile) {
                    //if (pos == tile.pos) {
                        tile.rotation = (tile.rotation + 1) % 4;
                        this.gameView.drawTile(this.context, tile);
//                  } else {
//                      this.gameView.computeBounds();
//                      this.redraw();
//                      this.gameState.nextTile();
//                      tile = this.gameState.getCurrentTile();
//                      if (tile) {
//                          this.turnState = TurnState.PLACE_THE_TILE;
//                      } else {
//                          this.turnState = TurnState.END_OF_GAME;
//                      }
//                  }
                }
                break;
            default:
                break;
        }
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        if (this.undrawPos) {
            this.gameView.drawAt(this.context, this.undrawPos);
        }
        let pos = this.getMousePos(e);
        let tile = this.gameState.getCurrentTile();
        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && this.gameState.isValidPlacement(pos)) {
                    this.context.strokeStyle = "white";
                } else {
                    this.context.strokeStyle = "red";
                }
            case TurnState.ROTATE_THE_TILE:
                if (tile) {
                    if (pos == tile.pos) {
                        this.context.strokeStyle = "yellow";
                    } else {
                        this.context.strokeStyle = "green";
                    }
                }
            default:
                this.context.strokeStyle = "red";
                break;
        }
        this.gameView.drawHighlight(this.context, pos);
        this.undrawPos = pos;
        e.preventDefault();
    }


}

function start() {
    new DrawingApp();
}
