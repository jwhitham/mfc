
import { GridXY, ScreenXY } from "./xy";
import { Tile } from "./tile";
import { GameState } from "./gamestate";

const background: string = "brown";
const initial = 3;

export class GameView {
    private gameState: GameState;
    private min: GridXY = new GridXY(0, 0);
    private max: GridXY = new GridXY(0, 0);
    private drawTileSize: number = 0;
    private topLeft: ScreenXY = new ScreenXY(0, 0);
    private size: ScreenXY;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.size = new ScreenXY(100, 100);
        this.computeScale(this.size.x, this.size.y);
    }
    
    private computeBounds() {
        let placed = this.gameState.getPlacedTiles();
        this.min = new GridXY(-initial, -initial);
        this.max = new GridXY(initial, initial);
        for (let i = 0; i < placed.length; i++) {
            let tile: Tile = placed[i];
            let tpos = tile.getPosition();
            if (tpos) {
                this.min.x = Math.min(this.min.x, tpos.x - 1);
                this.min.y = Math.min(this.min.y, tpos.y - 1);
                this.max.x = Math.max(this.max.x, tpos.x + 1);
                this.max.y = Math.max(this.max.y, tpos.y + 2);
            }
        }
    }

    public computeScale(width: number, height: number) {

        // size is used for the background
        this.size = new ScreenXY(width, height);

        // here we find out how many tiles should be shown
        this.computeBounds();
        let gridWidth = 1 + this.max.x - this.min.x;
        let gridHeight = 1 + this.max.y - this.min.y;

        // get the maximum possible tile size that still fits all tiles on screen
        let fitX = (width * 0.98) / gridWidth;
        let fitY = (height * 0.98) / gridHeight;
        this.drawTileSize = Math.max(Math.min(fitX, fitY), 1.0);

        // where are the corners?
        let tileWidth = this.drawTileSize * gridWidth;
        let tileHeight = this.drawTileSize * gridHeight;
        this.topLeft = new ScreenXY((width - tileWidth) * 0.5, (height - tileHeight) * 0.5);
    }

    public getScreenXY(pos: GridXY): ScreenXY {
        return new ScreenXY(this.topLeft.x + (this.drawTileSize * (pos.x - this.min.x)),
                            this.topLeft.y + (this.drawTileSize * (pos.y - this.min.y)));
    }

    public getGridXY(xy: ScreenXY): GridXY {
        return new GridXY(Math.floor((xy.x - this.topLeft.x) / this.drawTileSize) + this.min.x,
                          Math.floor((xy.y - this.topLeft.y) / this.drawTileSize) + this.min.y);

    }

    public getDrawTileSize(): number {
        return this.drawTileSize;
    }

    public drawTile(context: CanvasRenderingContext2D, tile: Tile) {
        let tpos = tile.getPosition();
        if (tpos) {
            let xy = this.getScreenXY(tpos);
            tile.draw(context, xy, this.drawTileSize);
        }
    }

    public drawAll(context: CanvasRenderingContext2D) {
        context.fillStyle = background;
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
            context.fillStyle = background;
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
}

