
import { GridXY, ScreenXY, ImageXY } from "./xy";

export class Tile {
    public pos: GridXY | null = null;
    public rotation: number = 0;
    private imageXY: ImageXY;
    private imageTileSize: number = 0;
    private image: HTMLImageElement;

    constructor(image: HTMLImageElement,
                imageXY: ImageXY, imageTileSize: number) {
        this.image = image;
        this.imageXY = imageXY;
        this.imageTileSize = imageTileSize;
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

export class TileSet {
    private image: HTMLImageElement;    // "mfc_tiles.jpg"
    private gridSize = 6;               // "mfc_tiles.jpg" is a 6x6 grid
    private tileSize = 310;             // each tile is roughly 310x310 pixels
    // location of top left corner of each of the 36 tiles in "mfc_tiles.jpg":
    private tileXY: number[] = 
           [49,61,423,55,789,54,1211,61,1579,62,1943,62,52,430,423,427,795,423,1216,429,1581,
            429,1952,430,52,843,423,846,795,842,1210,842,1580,841,1943,844,48,1217,423,1219,
            796,1217,1208,1212,1581,1213,1944,1215,56,1641,421,1637,794,1636,1211,1630,1581,
            1633,1940,1627,55,2004,427,2009,794,2004,1215,2002,1582,2000,1945,1994];

    constructor() {
        this.image = new Image();
        this.image.src = "mfc_tiles.jpg";
    }

    public getInitialTiles(): Tile[] {
        let allTiles: Tile[] = [];
        for (let i = 0; i < (this.gridSize * this.gridSize); i++) {
            allTiles.push(new Tile(this.image,
                                   new ImageXY(this.tileXY[i * 2], this.tileXY[(i * 2) + 1]),
                                   this.tileSize));
        }
        return allTiles;
    }
}

