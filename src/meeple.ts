
import { ScreenXY } from "./xy";
import { PlayerColour } from "./player";

export function getColourName(c: PlayerColour, intense: boolean): string {
    if (intense) {
        switch (c) {
            case PlayerColour.RED:
                return '#ff8080';
            case PlayerColour.GREEN:
                return '#80ff80';
            case PlayerColour.BLUE:
                return '#8080ff';
            case PlayerColour.YELLOW:
                return '#ffff80';
            default:
                return '#ffffff';
        }
    } else {
        switch (c) {
            case PlayerColour.RED:
                return '#c00000';
            case PlayerColour.GREEN:
                return '#00c000';
            case PlayerColour.BLUE:
                return '#0000ff';
            case PlayerColour.YELLOW:
                return '#808000';
            default:
                return '#c0c0c0';
        }
    }
}

function drawPath(context: CanvasRenderingContext2D,
                  xy: ScreenXY,
                  size: number)
{
    // both sides of body
    for (let mirror = -1.0; mirror <= 1.0; mirror += 2.0) {
    let points: []
        context.moveTo(xy.x, xy.y + (size * 0.6));
        context.lineTo(xy.x + (size * 0.4 * mirror), xy.y + size);
        context.lineTo(xy.x + (size * mirror), xy.y + size);
        context.lineTo(xy.x + (size * 0.6 * mirror), xy.y);
        context.lineTo(xy.x + (size * mirror), xy.y + (-0.2 * size));
        context.lineTo(xy.x + (size * mirror), xy.y + (-0.4 * size));
        context.lineTo(xy.x + (size * 0.4 * mirror), xy.y + (-0.6 * size));
    }
    // head
    context.arc(xy.x, xy.y + (-0.6 * size), 0.4 * size, -Math.PI, 0, false);
}

export function drawMeeple(context: CanvasRenderingContext2D,
                           xy: ScreenXY,
                           size: number,
                           completed: boolean,
                           colour: PlayerColour) {


    context.save();
    context.lineWidth = size * 0.1;

    context.beginPath();
    drawPath(context, xy, size);
    context.fillStyle = getColourName(colour, completed);
    context.fill();

    context.beginPath();
    drawPath(context, xy, size);
    if (completed) {
        context.strokeStyle = 'white';
    } else {
        context.strokeStyle = getColourName(colour, true);
    }
    context.stroke();
    context.restore();
}
