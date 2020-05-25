
import { GridXY, ScreenXY } from "./xy";
import { Tile } from "./tile";
import { GameState } from "./gamestate";

export class GameView {
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

