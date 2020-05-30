
import { GridXY, ScreenXY, ImageXY } from "./xy";
import { Roadmap, Direction } from "./roadmap";

export class Tile {
    private pos: GridXY | null = null;
    private rotation: number = 0;
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
        this.rotation = (this.rotation + 1) % 4;
    }

    public draw(context: CanvasRenderingContext2D,
                destXY: ScreenXY,
                drawTileSize: number) {

        let half = drawTileSize * 0.5;
        context.save();
        context.translate(destXY.x + half, destXY.y + half);
        if (this.rotation) {
            context.rotate(this.rotation * Math.PI * 0.5);
        }
        context.drawImage(this.image,
                          this.imageXY.x, this.imageXY.y,
                          this.imageTileSize, this.imageTileSize,
                          -half, -half, drawTileSize, drawTileSize);
        this.roadmap.getRoad(Direction.NORTH)
        context.restore();
    }
}

