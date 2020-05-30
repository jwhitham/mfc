
import { GridXY } from "./xy";
import { Tile } from "./tile";
import { TileSet } from "./tileset";

export class GameState {
    private placed: Tile[] = [];
    private unplaced: Tile[] = [];

    constructor(tileSet: TileSet) {
        this.unplaced = tileSet.getInitialTiles();
        // shuffle...!
    }

    public getPlacedTiles(): Tile[] {
        return this.placed;
    }

    public getCurrentTile(): Tile | null {

        if (this.unplaced.length) {
            return this.unplaced[this.unplaced.length - 1];
        } else {
            return null;
        }
    }

    public nextTile() {
        let tile = this.getCurrentTile();
        if (tile) {
            this.unplaced.pop();
            this.placed.push(tile);
        }
    }

    public getTileAt(pos: GridXY): Tile | null {
        let placed = this.placed;
        let tile = this.getCurrentTile();
        if (tile && tile.isAt(pos)) {
            return tile;
        }
        for (let i = 0; i < placed.length; i++) {
            tile = placed[i];
            if (tile.isAt(pos)) {
                return tile;
            }
        }

        return null;
    }

    public isValidPlacement(pos: GridXY): boolean {
        let placed = this.placed;
        let nextTo = false;
        if (this.getCurrentTile() == null) {
            return false; // no tile to place
        }
        if (placed.length == 0) {
            // valid to place in 0, 0
            return (pos.x == 0) && (pos.y == 0);
        }
        for (let i = 0; i < placed.length; i++) {
            let tile: Tile = placed[i];
            let tpos = tile.getPosition();

            if (tpos && tpos.x == pos.x) {
                if (tpos.y == pos.y) {
                    return false; // tile already placed there
                } else if (tpos.y == (pos.y - 1)) {
                    nextTo = true;
                } else if (tpos.y == (pos.y + 1)) {
                    nextTo = true;
                }
            } else if (tpos && tpos.y == pos.y) {
                if (tpos.x == (pos.x - 1)) {
                    nextTo = true;
                } else if (tpos.x == (pos.x + 1)) {
                    nextTo = true;
                }
            }
        }
        return nextTo;
    }
}

