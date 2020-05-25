

import { GridXY, ScreenXY } from "./xy";
import { Tile, TileSet } from "./tile";

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
            if (tile.pos && (tile.pos.x == pos.x) && (tile.pos.y == pos.y)) {
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
            if (tile.pos && tile.pos.x == pos.x) {
                if (tile.pos.y == pos.y) {
                    return false; // tile already placed there
                } else if (tile.pos.y == (pos.y - 1)) {
                    nextTo = true;
                } else if (tile.pos.y == (pos.y + 1)) {
                    nextTo = true;
                }
            } else if (tile.pos && tile.pos.y == pos.y) {
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
    private gameState: GameState;
    private min: GridXY = new GridXY(0, 0);
    private max: GridXY = new GridXY(0, 0);
    private drawTileSize: number = 0;
    private origin: ScreenXY = new ScreenXY(0, 0);
    private size: ScreenXY = new ScreenXY(0, 0);
    private background: string = "brown";

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.computeScale(100.0, 100.0);
    }
    
    public computeBounds() {
        let placed = this.gameState.getPlacedTiles();
        this.min = new GridXY(-3, -3);
        this.max = new GridXY(3, 3);
        for (let i = 0; i < placed.length; i++) {
            let tile: Tile = placed[i];
            if (tile.pos) {
                this.min.x = Math.min(this.min.x, tile.pos.x);
                this.min.y = Math.min(this.min.y, tile.pos.y);
                this.max.x = Math.max(this.max.x, tile.pos.x);
                this.max.y = Math.max(this.max.y, tile.pos.y);
            }
        }
    }

    public computeScale(width: number, height: number) {

        this.computeBounds();
        this.size = new ScreenXY(width, height);
        let gridWidth = 3 + this.max.x - this.min.x;
        let gridHeight = 3 + this.max.y - this.min.y;
        let fitX = (width * 0.98) / gridWidth;
        let fitY = (height * 0.98) / gridHeight;
        this.drawTileSize = Math.max(Math.min(fitX, fitY), 1.0);
        this.origin = new ScreenXY((width * 0.5) - (this.drawTileSize * 0.5),
                                   (height * 0.5) - (this.drawTileSize * 0.5));
    }

    public getScreenXY(pos: GridXY): ScreenXY {
        return new ScreenXY(this.origin.x + (this.drawTileSize * pos.x),
                            this.origin.y + (this.drawTileSize * pos.y));
    }

    public getDrawTileSize(): number {
        return this.drawTileSize;
    }

    public drawTile(context: CanvasRenderingContext2D, tile: Tile) {
        if (tile.pos) {
            let xy = this.getScreenXY(tile.pos);
            tile.draw(context, xy, this.drawTileSize);
        }
    }

    public drawAll(context: CanvasRenderingContext2D) {
        context.fillStyle = this.background;
        context.fillRect(0, 0, this.size.x, this.size.y);

        let tile = this.gameState.getCurrentTile();
        if (tile) {
            this.drawTile(context, tile);
        }

        let placed = this.gameState.getPlacedTiles();
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

    public getGridXY(xy: ScreenXY): GridXY {
        return new GridXY(Math.floor((xy.x - this.origin.x) / this.drawTileSize),
                          Math.floor((xy.y - this.origin.y) / this.drawTileSize));

    }
}

class FloatingButton {

    private image: HTMLImageElement;
    private gameView: GameView;
    private topLeft: ScreenXY | null = null;
    private bottomRight: ScreenXY | null = null;
    private hAlign: number = 0;
    private vAlign: number = 0;

    constructor(src: string, gameView: GameView, hAlign: number, vAlign: number) {
        this.image = new Image();
        this.image.src = src;
        this.gameView = gameView;
        this.hAlign = hAlign;
        this.vAlign = vAlign;
    }

    public setPosition(tile: Tile) {
        if ((!tile) || (!tile.pos)) {
            this.remove();
            return;
        }
        let xy = this.gameView.getScreenXY(tile.pos);
        let drawTileSize = this.gameView.getDrawTileSize();
        let half = drawTileSize * 0.5;
        let quarter = half * 0.5;
        // go to middle of tile
        xy.x += half;
        xy.y += half;
        // go to middle of button
        xy.x += drawTileSize * this.hAlign;
        xy.y += drawTileSize * this.vAlign;
        // go to top left of button
        xy.x -= quarter;
        xy.y -= quarter;
        // set button size and position
        this.topLeft = xy;
        this.bottomRight = new ScreenXY(xy.x + half, xy.y + half);
    }

    public remove() {
        this.topLeft = null;
        this.bottomRight = null;
    }

    public intersect(xy: ScreenXY): boolean {
        if (this.topLeft && this.bottomRight) {
            return (xy.x >= this.topLeft.x)
                && (xy.x < this.bottomRight.x)
                && (xy.y >= this.topLeft.y)
                && (xy.y < this.bottomRight.y);
        }
        return false;
    }

    public draw(context: CanvasRenderingContext2D, mouseXY: ScreenXY) {
        let xy = this.topLeft;
        if (xy && this.bottomRight) {
            let destWidth = this.bottomRight.x - xy.x;
            let destHeight = this.bottomRight.y - xy.y;

            context.fillStyle = 'gray';
            context.fillRect(xy.x + 5, xy.y + 5, destWidth, destHeight);
            context.fillStyle = 'white';
            context.fillRect(xy.x, xy.y, destWidth, destHeight);
            context.drawImage(this.image,
                              0, 0,
                              this.image.width, this.image.height,
                              xy.x, xy.y,
                              destWidth, destHeight);
            if (this.intersect(mouseXY)) {
                context.strokeStyle = 'white';
            } else {
                context.strokeStyle = 'black';
            }
            context.strokeRect(xy.x, xy.y, destWidth, destHeight);
        }
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
    private acceptButton: FloatingButton;
    private rotateButton: FloatingButton;
    private cancelButton: FloatingButton;


    constructor() {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;
        this.tileSet = new TileSet();
        this.gameState = new GameState(this.tileSet);
        this.gameView = new GameView(this.gameState);
        let firstTile = this.gameState.getCurrentTile();
        if (firstTile) {
            firstTile.pos = new GridXY(0, 0);
        }
        this.gameState.nextTile();

        this.acceptButton = new FloatingButton("accept.png", this.gameView, -1, 1);
        this.rotateButton = new FloatingButton("rotate.png", this.gameView, 0, 1);
        this.cancelButton = new FloatingButton("cancel.png", this.gameView, 1, 1);

        this.createUserEvents();
        this.redraw();
    }

    private createUserEvents() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", (e: MouseEvent) => this.pressEventHandler(e));
        canvas.addEventListener("mousemove", (e: MouseEvent) => this.dragEventHandler(e));

        canvas.addEventListener("touchstart", (e: TouchEvent) => this.pressEventHandler(e));
        canvas.addEventListener("touchmove", (e: TouchEvent) => this.dragEventHandler(e));

        window.addEventListener("resize", () => this.redraw(), false);
    }

    private redraw() {
        let context = this.context;
        let canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gameView.computeScale(canvas.width, canvas.height);
        this.gameView.drawAll(context);
        this.undrawPos = null;
        this.drawButtons(new ScreenXY(-100, -100));
    }

    private drawButtons(mouseXY: ScreenXY) {
        let context = this.context;
        let tile = this.gameState.getCurrentTile();

        switch (this.turnState) {
            case TurnState.ROTATE_THE_TILE:
                if (tile) {
                    this.rotateButton.setPosition(tile);
                    this.acceptButton.setPosition(tile);
                    this.cancelButton.setPosition(tile);
                }
                this.rotateButton.draw(context, mouseXY);
                this.acceptButton.draw(context, mouseXY);
                this.cancelButton.draw(context, mouseXY);
                break;
            default:
                this.rotateButton.remove();
                this.acceptButton.remove();
                this.cancelButton.remove();
                break;
        }
    }

    private getMousePos(e: MouseEvent | TouchEvent): ScreenXY {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        return new ScreenXY(mouseX, mouseY);
    }

    private pressEventHandler(e: MouseEvent | TouchEvent) {
        let xy = this.getMousePos(e);
        let pos = this.gameView.getGridXY(xy);
        let tile = this.gameState.getCurrentTile();

        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && this.gameState.isValidPlacement(pos)) {
                    tile.pos = pos;
                    this.turnState = TurnState.ROTATE_THE_TILE;
                    this.redraw();
                }
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile && this.rotateButton.intersect(xy)) {
                    tile.rotation = (tile.rotation + 1) % 4;
                    this.redraw();
                } else if (tile && this.acceptButton.intersect(xy)) {
                    // finish placing
                    this.gameState.nextTile();
                    this.redraw();
                    tile = this.gameState.getCurrentTile();
                    if (tile) {
                        this.turnState = TurnState.PLACE_THE_TILE;
                    } else {
                        this.turnState = TurnState.END_OF_GAME;
                    }
                } else if (tile && this.cancelButton.intersect(xy)) {
                    // unplace tile
                    tile.pos = null;
                    this.turnState = TurnState.PLACE_THE_TILE;
                    this.redraw();
                }
                break;
            default:
                break;
        }
    }

    private dragEventHandler(e: MouseEvent | TouchEvent) {
        if (this.undrawPos) {
            this.gameView.drawAt(this.context, this.undrawPos);
        }
        let xy = this.getMousePos(e);
        let pos = this.gameView.getGridXY(xy);
        let tile = this.gameState.getCurrentTile();
        this.gameView.drawAt(this.context, pos);
        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && this.gameState.isValidPlacement(pos)) {
                    this.context.strokeStyle = "white";
                } else {
                    this.context.strokeStyle = "red";
                }
                this.gameView.drawHighlight(this.context, pos);
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile && tile.pos) {
                    this.context.strokeStyle = "yellow";
                    this.gameView.drawHighlight(this.context, tile.pos);
                }
                break;
            default:
                break;
        }
        this.undrawPos = pos;
        this.drawButtons(xy);
        e.preventDefault();
    }


}

export function start(): void {
    new DrawingApp();
}
