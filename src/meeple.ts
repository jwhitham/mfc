
import { ScreenXY } from "./xy";
import { PlayerColour } from "./player";

export function getColour(c: PlayerColour): string {
    switch (c) {
        case PlayerColour.RED:
            return 'red';
        case PlayerColour.GREEN:
            return 'green';
        case PlayerColour.BLUE:
            return 'blue';
        case PlayerColour.YELLOW:
            return 'yellow';
        default:
            return 'white';
    }
}

export function drawMeeple(context: CanvasRenderingContext2D,
                           xy: ScreenXY,
                           size: number,
                           completed: boolean,
                           colour: PlayerColour) {


    context.save();
    context.strokeStyle = getColour(colour);
    context.fillStyle = context.strokeStyle;
    context.lineWidth = size * 0.1;
    context.beginPath();
    context.arc(xy.x, xy.y, size, 0, Math.PI * 2.0, true);
    if (completed) {
        context.fill();
    } else {
        context.stroke();
    }
    context.restore();
}
