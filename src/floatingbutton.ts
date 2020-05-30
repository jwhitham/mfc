

import { ScreenXY } from "./xy";
import { Tile } from "./tile";
import { GameView } from "./gameview";


export class FloatingButton {

    private image: HTMLImageElement;
    private gameView: GameView;
    private topLeft: ScreenXY | null = null;
    private bottomRight: ScreenXY | null = null;
    private hAlign: number = 0;
    private vAlign: number = 0;

    constructor(image: HTMLImageElement, gameView: GameView, hAlign: number, vAlign: number) {
        this.image = image;
        this.gameView = gameView;
        this.hAlign = hAlign;
        this.vAlign = vAlign;
    }

    public setPosition(tile: Tile) {
        if (!tile) {
            this.remove();
            return;
        }
        let tpos = tile.getPosition();
        if (!tpos) {
            this.remove();
            return;
        }
        let xy = this.gameView.getScreenXY(tpos);
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


