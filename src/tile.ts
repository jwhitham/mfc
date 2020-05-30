
import { GridXY, ScreenXY, ImageXY } from "./xy";
import { Roadmap, Road } from "./roadmap";
import { PlayerColour } from "./player";
import { Direction, getVector, getRotated, getRadians } from "./direction";

let DEBUG_ROADS = true;

export class Tile {
    private pos: GridXY | null = null;
    private rotation: Direction = Direction.NORTH;
    private imageXY: ImageXY;
    private imageTileSize: number = 0;
    private image: HTMLImageElement;
    private roadmap: Roadmap;

    constructor(image: HTMLImageElement,
                imageXY: ImageXY, imageTileSize: number,
                roadmapCodes: string) {
        this.image = image;
        this.imageXY = imageXY;
        this.imageTileSize = imageTileSize;
        this.roadmap = new Roadmap(roadmapCodes);
    }

    public setPosition(pos: GridXY | null) {
        this.pos = pos;
    }

    public getPosition(): GridXY | null {
        return this.pos;
    }

    public isAt(pos: GridXY): boolean {
        if (this.pos) {
            return (pos.x == this.pos.x) && (pos.y == this.pos.y);
        }
        return false;
    }

    public rotate() {
        this.rotation = getRotated(this.rotation);
        this.roadmap.rotate();
    }

    public link(toTarget: Direction, target: Tile | null): Road | null {
        if (target) {
            return this.roadmap.link(toTarget, target.roadmap);
        } else {
            return null;
        }
    }

    private drawDebugRoads(context: CanvasRenderingContext2D,
                           half: number) {
        let roads = this.roadmap.getRoads();
        for (let i = 0; i < roads.length; i++) {
            let r = roads[i];
            let d1 = r.getD1();
            let d2 = r.getD2();
            let xy1 = getVector(d1, half);
            let xy2 = getVector(d2, half);
            if (d1 == Direction.END) {
                xy1 = getVector(d2, half * 0.5);
            } else if (d2 == Direction.END) {
                xy2 = getVector(d1, half * 0.5);
            }
            context.lineWidth = half * 0.25;
            if (r.isComplete()) {
                context.lineWidth = half * 0.125;
            }
            switch (r.getMeeple()) {
                case PlayerColour.RED:
                    context.strokeStyle = 'red'; break;
                case PlayerColour.GREEN:
                    context.strokeStyle = 'green'; break;
                case PlayerColour.BLUE:
                    context.strokeStyle = 'blue'; break;
                case PlayerColour.YELLOW:
                    context.strokeStyle = 'yellow'; break;
                case PlayerColour.NONE:
                    context.strokeStyle = 'white'; break;
            }
            context.beginPath();
            context.moveTo(xy1.x, xy1.y);
            context.lineTo(xy2.x, xy2.y);
            context.stroke();
        }
    }

    public draw(context: CanvasRenderingContext2D,
                destXY: ScreenXY,
                drawTileSize: number) {

        let half = drawTileSize * 0.5;
        context.save();
        context.translate(destXY.x + half, destXY.y + half);
        context.rotate(getRadians(this.rotation));
        context.drawImage(this.image,
                          this.imageXY.x, this.imageXY.y,
                          this.imageTileSize, this.imageTileSize,
                          -half, -half, drawTileSize, drawTileSize);
        context.restore();
        if (DEBUG_ROADS) {
            context.save();
            context.translate(destXY.x + half, destXY.y + half);
            this.drawDebugRoads(context, half);
            context.restore();
        }
    }
}

