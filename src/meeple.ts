
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

    // draw the right hand side, from head downwards
    let body: number[] = 
       [0.4, -0.6,
        1.0, -0.4,
        1.0, -0.2,
        0.6,  0.0,
        1.0,  1.0,
        0.4,  1.0,
        0.0,  0.6];
   
    // mirror the right hand drawing commands for the left hand side, feet to head        
    for (let i = body.length - 4; i >= 0; i -= 2) {
        body.push(-body[i]); // x is mirrored
        body.push(body[i + 1]); // y is the same
    }

    // translate and scale
    for (let i = 0; i < body.length; i += 2) {
        body[i] = (body[i] * size) + xy.x;
        body[i + 1] = (body[i + 1] * size) + xy.y;
    }

    context.moveTo(body[0], body[1]);
    for (let i = 2; i < body.length; i += 2) {
        context.lineTo(body[i], body[i + 1]);
    }
    context.arc(xy.x, body[1], size * 0.4, -Math.PI, 0.0, false);
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
