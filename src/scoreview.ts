
import { drawMeeple, getColourName } from "./meeple";
import { MAX_SCORE } from "./player";
const SCORE_FONT = '20px serif';


class ScoreView {

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.size = new ScreenXY(100, 100);
        this.computeScale(this.size.x, this.size.y);
    }

    public computeScale(context: CanvasRenderingContext2D, maxWidth: number) {
        context.save();

        // decide on an appropriate font size for this scale
        // aim is to fit into maxWidth
    }

    public tryScale(context: CanvasRenderingContext2D, fontPixels: number) {
        context.font = "" + fontPixels + "px Serif";
        for (let p of this.gameState.getPlayers()) {
            let metrics = context.measureText(p.getName());
            width = Math.max(metrics.width, width);

        let textMaxWidth = 0;


            textMaxHeight = Math.max(textMaxHeight,
                                     Math.abs(metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent));
            textMaxWidth = Math.max(textMaxWidth, metrics.width);
        }

        this.scoreMeepleSize = yTextHeight * 0.75;
    }

    public drawScore(context: CanvasRenderingContext2D) {
        let xy = new ScreenXY(0, 0);

        context.save();
        context.font = '20px serif';
        let metrics = context.measureText('PLAYER NAME');
        let yTextHeight = Math.abs(metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent);
        let meepleGap = yTextHeight * 2;
        let meepleSize = yTextHeight * 0.75;

        for (let p of this.gameState.getPlayers()) {

            let score = p.getScore();
            let colour = p.getColour();
            context.strokeStyle = getColourName(colour, true);
            context.fillStyle = context.strokeStyle;
            xy.x = meepleGap - meepleSize;
            xy.y += yTextHeight;
            context.fillText(p.getName(), xy.x, xy.y);
            xy.y += yTextHeight;
            xy.x = meepleSize;

            for (let i = 1; i <= MAX_SCORE; i++) {
                drawMeeple(context, xy, meepleSize, i <= score, colour);
                xy.x += meepleGap;
            }
            xy.y += yTextHeight;
            xy.y += yTextHeight;
        }
        context.restore();
    }
}
