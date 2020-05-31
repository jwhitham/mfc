
import { GridXY } from "./xy";
import { Tile } from "./tile";
import { TileSet } from "./tileset";
import { Road } from "./roadmap";
import { Direction } from "./direction";
import { Player, PlayerColour } from "./player";

export class GameState {
    private placed: Tile[] = [];
    private unplaced: Tile[] = [];
    private players: Player[] = [];
    private currentPlayer: number = -1;

    constructor(tileSet: TileSet) {
        this.unplaced = tileSet.getInitialTiles();
        this.shuffle();
    }

    private shuffle() {
        // Fisher-Yates, Durstenfeld variant
        for (let i = this.unplaced.length - 1; i > 0; i--) {
            // pick a tile j with 0 <= j <= i (note, j = i is possible)
            let j = Math.floor(Math.random() * (i + 1));
            // swap tiles i & j
            let ti = this.unplaced[i];
            let tj = this.unplaced[j];
            this.unplaced[i] = tj;
            this.unplaced[j] = ti;
        }
    }

    public addPlayer(p: Player) {
        if (p.getColour() == PlayerColour.NONE) {
            throw "player can't have colour NONE";
        }
        for (let p2 of this.players) {
            if (p2.getColour() == p.getColour()) {
                throw "player with this colour was already added";
            }
        }
        this.players.push(p);
    }

    public getPlayers(): Player[] {
        return this.players;
    }

    public getCurrentPlayer(): Player | null {
        if (this.currentPlayer >= 0) {
            return this.players[this.currentPlayer];
        } else {
            return null;
        }
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
        for (let p of this.players) {
            if (p.isWinner()) {
                gameOver = true;
            }
        }

        // no players, no game!
        if (this.players.length == 0) {
            gameOver = true;
        }

        // next player
        if (gameOver) {
            this.currentPlayer = -1;
        } else {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
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
        let tile = this.getCurrentTile();
        if (tile && tile.isAt(pos)) {
            return tile;
        }
        for (let tile of this.placed) {
            if (tile.isAt(pos)) {
                return tile;
            }
        }

        return null;
    }

    public isValidPlacement(pos: GridXY): boolean {
        let nextTo = false;
        if (this.getCurrentTile() == null) {
            return false; // no tile to place
        }
        if (this.placed.length == 0) {
            // valid to place in 0, 0
            return (pos.x == 0) && (pos.y == 0);
        }
        for (let tile of this.placed) {
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

