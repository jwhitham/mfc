
import { ImageXY } from "./xy";
import { Tile } from "./tile";
import { ImageTracker } from "./imagetracker";

const gridSize = 6;               // "mfc_tiles.jpg" is a 6x6 grid
const tileSize = 310;             // each tile is roughly 310x310 pixels
// location of top left corner of each of the 36 tiles in "mfc_tiles.jpg":
const tileXY: number[] = 
       [49,61,423,55,789,54,1211,61,1579,62,1943,62,52,430,423,427,795,423,1216,429,1581,
        429,1952,430,52,843,423,846,795,842,1210,842,1580,841,1943,844,48,1217,423,1219,
        796,1217,1208,1212,1581,1213,1944,1215,56,1641,421,1637,794,1636,1211,1630,1581,
        1633,1940,1627,55,2004,427,2009,794,2004,1215,2002,1582,2000,1945,1994];

// roadmap string for each tile
// nswe: compass directions which are linked, e.g. "we" = link from west to east
// GYRB: colours on the tile
const roadmap: string[] =
        ["", "weG", "nsY", "wsG;neR", "nsR", "nsB",
         "", "nsG", "ewY", "wsG;neR", "nsR", "ewB",
         "", "wsR", "nwY;esG", "wsY", "wsG", "neB;swR",
         "", "wsR", "neY;wsG", "nsG", "wsY", "wsB;neY",
         "wsB;neG", "nsY", "nwY;esR", "wnG;esB", "esB", "wsB;neY",
         "nsB", "nsR", "wsY;neR", "esG", "neB", "nwR;esB"];

export class TileSet {
    private image: HTMLImageElement;    // "mfc_tiles.jpg"

    constructor(imageTracker: ImageTracker) {
        this.image = imageTracker.request("mfc_tiles.jpg");
    }

    public getInitialTiles(): Tile[] {
        let allTiles: Tile[] = [];
        for (let i = 0; i < (gridSize * gridSize); i++) {
            let xy = new ImageXY(tileXY[i * 2], tileXY[(i * 2) + 1]);
            allTiles.push(new Tile(this.image, xy, tileSize, roadmap[i]));
        }
        return allTiles;
    }
}


