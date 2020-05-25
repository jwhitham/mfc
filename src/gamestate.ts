
import { GridXY } from "./xy";
import { Tile, TileSet } from "./tile";

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
        if (tile && tile.pos && (tile.pos.x == pos.x) && (tile.pos.y == pos.y)) {
            return tile;
        }
        for (let i = 0; i < placed.length; i++) {
            tile = placed[i];
            if (tile.pos && (tile.pos.x == pos.x) && (tile.pos.y == pos.y)) {
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
            if (tile.pos && tile.pos.x == pos.x) {
                if (tile.pos.y == pos.y) {
                    return false; // tile already placed there
                } else if (tile.pos.y == (pos.y - 1)) {
                    nextTo = true;
                } else if (tile.pos.y == (pos.y + 1)) {
                    nextTo = true;
                }
            } else if (tile.pos && tile.pos.y == pos.y) {
                if (tile.pos.x == (pos.x - 1)) {
                    nextTo = true;
                } else if (tile.pos.x == (pos.x + 1)) {
                    nextTo = true;
                }
            }
        }
        return nextTo;
    }
}

