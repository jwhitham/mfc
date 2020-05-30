
import { GridXY } from "./xy";
import { Tile } from "./tile";
import { TileSet } from "./tileset";
import { Road } from "./roadmap";
import { Direction } from "./direction";
import { Player } from "./player";

export class GameState {
    private placed: Tile[] = [];
    private unplaced: Tile[] = [];
    private players: Player[] = [];

    constructor(tileSet: TileSet) {
        this.unplaced = tileSet.getInitialTiles();
        // shuffle...!
    }

    public addPlayer(p: Player) {
        this.players.push(p);
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

    public nextTile(): boolean {
        // finalise placement of a tile
        let newTile = this.getCurrentTile();
        let gameOver = false;
        if (newTile) {
            this.unplaced.pop();
            this.placed.push(newTile);

            // scoring
            let pos = newTile.getPosition();
            if (pos) {
                this.score(newTile.link(Direction.NORTH,
                                        this.getTileAt(new GridXY(pos.x, pos.y - 1))));
                this.score(newTile.link(Direction.EAST,
                                        this.getTileAt(new GridXY(pos.x + 1, pos.y))));
                this.score(newTile.link(Direction.SOUTH,
                                        this.getTileAt(new GridXY(pos.x, pos.y + 1))));
                this.score(newTile.link(Direction.WEST,
                                        this.getTileAt(new GridXY(pos.x - 1, pos.y))));
            }
        }

        // any tiles left?
        if (this.unplaced.length == 0) {
            gameOver = true;
        }

        // did any player win?
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (p.isWinner()) {
                gameOver = true;
            }
        }
        return gameOver;
    }

    private score(road: Road | null) {
        if (!road) {
            // road is incomplete
            return;
        }
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            p.addScore(road.getScore(p.getColour()));
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

