
import { ScreenXY } from "./xy";
import { GameState } from "./gamestate";
import { drawMeeple, getColourName } from "./meeple";
import { MAX_SCORE } from "./player";


const BACKGROUND = "black";

export class ScoreView {

    private gameState: GameState;
    private size: ScreenXY;
    private fontName = "";
    private fontSize = 1;
    private fontSize2 = 1;
    private meepleSize = 1;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.size = new ScreenXY(100, 100);
    }

    public computeScale(context: CanvasRenderingContext2D,
                        canvas: HTMLCanvasElement) {

        context.save();
        // size is used for the background
        let maxWidth = canvas.width;
        let height = canvas.height;
        this.size = new ScreenXY(maxWidth, height);

        // decide on an appropriate font size for this scale
        // aim is to fit into maxWidth
        let minFont = 8;
        let maxFont = 200;
        let minWidth = maxWidth * 0.9;
        let lastSize = 0;
        while (1) {
            let requestSize = Math.floor((minFont + maxFont) / 2);
            if (requestSize == lastSize) {
                break;
            }
            lastSize = requestSize;
            context.font = this.fontName = "" + requestSize + "px serif";

            // drawn at alphabetic baseline

            // measure font size top of em square - bottom of em square

            // calculate width, height based on text printed with font
            let width = 1;
            let height = 1;
            for (let p of this.gameState.getPlayers()) {
                let metrics = context.measureText(p.getName());
                width = Math.max(metrics.width, width);
                height = Math.max(metrics.actualBoundingBoxAscent, height);
            }
            this.fontSize = Math.ceil(height);
            this.fontSize2 = this.fontSize * 2;
            this.meepleSize = this.fontSize * 0.9;

            // calculate width based on meeples and max score
            width = Math.max(this.fontSize2 * (MAX_SCORE + 1), width);
            width = Math.ceil(width);

            if (width >= maxWidth) {
                maxFont = this.fontSize;
            } else if (width < minWidth) {
                minFont = this.fontSize;
            } else {
                break;
            }
        }
        context.restore();
    }

    public drawScore(context: CanvasRenderingContext2D) {
        let xy = new ScreenXY(0, 0);

        context.save();
        context.fillStyle = BACKGROUND;
        context.fillRect(0, 0, this.size.x, this.size.y);
        context.font = this.fontName;

        let currentPlayer = this.gameState.getCurrentPlayer();
        let pHeight = this.fontSize2 * 3;

        for (let p of this.gameState.getPlayers()) {
            let colour = p.getColour();
            let score = p.getScore();

            context.strokeStyle = getColourName(colour, true);
            if (p.isWinner()) {
                context.fillStyle = "#806080";
                context.fillRect(0, xy.y, this.size.x, pHeight);
                context.strokeRect(0, xy.y, this.size.x, pHeight);
            } else if (p == currentPlayer) {
                context.fillStyle = "#404040";
                context.fillRect(0, xy.y, this.size.x, pHeight);
                context.strokeRect(0, xy.y, this.size.x, pHeight);
            }
            xy.x = this.fontSize;
            xy.y += this.fontSize2;
            context.fillStyle = context.strokeStyle;
            context.fillText(p.getName(), xy.x, xy.y);
            xy.y += this.fontSize2;
            for (let i = 1; i <= MAX_SCORE; i++) {
                xy.x += this.fontSize;
                drawMeeple(context, xy, this.meepleSize, i <= score, colour);
                xy.x += this.fontSize;
            }
            xy.y += this.fontSize2;
        }

    
        let tile = this.gameState.getCurrentTile();
        if (tile && currentPlayer) {
            xy.x = this.fontSize;
            xy.y += this.fontSize2;
            context.fillStyle = "white";
            context.fillText("Next Tile", xy.x, xy.y);
            xy.y += this.fontSize;
            xy.x = this.size.x * 0.25;
            let half = this.size.x * 0.5;
            tile.draw(context, xy, half);
            for (let p of this.gameState.getPlayers()) {
                tile.drawMeeples(context, xy, half, p.getColour());
            }
        }

        context.restore();
    }
}
