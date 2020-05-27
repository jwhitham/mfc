
import { GridXY, ScreenXY, ImageXY } from "./xy";
import { Roadmap } from "./roadmap";

export class Tile {
    public pos: GridXY | null = null;
    public rotation: number = 0;
    private imageXY: ImageXY;
    private imageTileSize: number = 0;
    private image: HTMLImageElement;
    private roadmap: Roadmap;

    constructor(image: HTMLImageElement,
                imageXY: ImageXY, imageTileSize: number,
                roadmap: Roadmap) {
        this.image = image;
        this.imageXY = imageXY;
        this.imageTileSize = imageTileSize;
        this.roadmap = roadmap;
    }

    public getRoadmap(): Roadmap {
        return this.roadmap;
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
        context.restore();
    }
}

