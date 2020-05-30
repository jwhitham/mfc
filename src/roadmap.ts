
export enum Player { RED, YELLOW, GREEN, BLUE, NONE };
import { Direction, getOpposite, getRotated } from "./direction";

export class Road {
    private d1: Direction;
    private d2: Direction;
    private meeple: Player;
    private connected: Road[] = [];
    private isEnd: boolean = false;
    private isFinished: boolean = false;
    private isVisited: boolean = false;

    constructor(d1: Direction, d2: Direction, meeple: Player) {
        this.d1 = d1;
        this.d2 = d2;
        this.meeple = meeple;
        this.isEnd = this.hasDirection(Direction.END);
    }

    public hasDirection(d: Direction): boolean {
        return (this.d1 == d) || (this.d2 == d);
    }

    public connect(anotherRoad: Road) {
        this.connected.push(anotherRoad);
        if (this.isEnd) {
            if (this.connected.length == 1) {
                this.isFinished = true;
            } else {
                throw "too many connections for an end road";
            }
        } else {
            if (this.connected.length == 2) {
                this.isFinished = true;
            } else if (this.connected.length > 2) {
                throw "too many connections for a through road";
            }
        }
    }

    public getD1(): Direction {
        return this.d1;
    }

    public getD2(): Direction {
        return this.d2;
    }

    public getMeeple(): Player {
        return this.meeple;
    }

    public rotate() {
        this.d1 = getRotated(this.d1);
        this.d2 = getRotated(this.d2);
    }

    private visit(callback: (r: Road) => void) {
        this.isVisited = true;
        callback(this);
        for (let i = 0; i < this.connected.length; i++) {
            let r = this.connected[i];
            if (!r.isVisited) {
                r.visit(callback);
            }
        }
    }

    private clear() {
        this.isVisited = false;
        for (let i = 0; i < this.connected.length; i++) {
            let r = this.connected[i];
            if (r.isVisited) {
                r.clear();
            }
        }
    }

    public isComplete(): boolean {
        let complete = true;
        this.visit((r: Road) => {
            if (!r.isFinished) {
                complete = false;
            }
        });
        this.clear();
        return complete;
    }

    public getScore(colour: Player): number {
        let score = 0;
        this.visit((r: Road) => {
            if (colour == r.meeple) {
                score ++;
            }
        });
        this.clear();
        return score;
    }
}

export class Roadmap {

    private roads: Road[] = [];
    private roadmapCodes: string;

    constructor(roadmapCodes: string) {
        let directions: Direction[] = [];
        let meeples: Player[] = [];

        this.roadmapCodes = roadmapCodes;
        for (let i = 0; i < roadmapCodes.length; i++) {
            let code = roadmapCodes[i];
            // codes may not appear twice
            for (let j = i + 1; j < roadmapCodes.length; j++) {
                if (roadmapCodes[j] == code) {
                    throw "code '" + code + "'appears twice: " + roadmapCodes;
                }
            }
            switch (code) {
                case 'n': directions.push(Direction.NORTH); break;
                case 'e': directions.push(Direction.EAST); break;
                case 's': directions.push(Direction.SOUTH); break;
                case 'w': directions.push(Direction.WEST); break;
                case 'R': meeples.push(Player.RED); break;
                case 'Y': meeples.push(Player.YELLOW); break;
                case 'G': meeples.push(Player.GREEN); break;
                case 'B': meeples.push(Player.BLUE); break;
                case ';':
                    this.addRoad(directions, meeples);
                    meeples = [];
                    directions = [];
                    break;
                default:
                    throw "code '" + code + "' is not valid: " + roadmapCodes;
            }
        }
        this.addRoad(directions, meeples);
        this.addEnd(Direction.NORTH);
        this.addEnd(Direction.EAST);
        this.addEnd(Direction.SOUTH);
        this.addEnd(Direction.WEST);
    }

    private addRoad(directions: Direction[], meeples: Player[]) {
        if (directions.length == 0) {
            return;
        }
        if (directions.length != 2) {
            throw "road must link exactly two edges: " + this.roadmapCodes;
        }
        if (meeples.length > 1) {
            throw "road must have at most one meeple: " + this.roadmapCodes;
        }
        if (meeples.length == 0) {
            this.roads.push(new Road(directions[0], directions[1], Player.NONE));
        } else {
            this.roads.push(new Road(directions[0], directions[1], meeples[0]));
        }
    }

    private addEnd(direction: Direction) {
        // If a road is not present on the map, add a dead end
        if (this.getRoad(direction) == null) {
            this.roads.push(new Road(direction, Direction.END, Player.NONE));
        }
    }

    private getRoad(direction: Direction): Road | null {
        for (let i = 0; i < this.roads.length; i++) {
            let r = this.roads[i];
            if (r.hasDirection(direction)) {
                return r;
            }
        }
        return null;
    }

    public getRoads(): Road[] {
        return this.roads;
    }

    public rotate() {
        for (let i = 0; i < this.roads.length; i++) {
            let r = this.roads[i];
            r.rotate();
        }
    }

    public link(toTarget: Direction, target: Roadmap): Road | null {

        let source = this;
        let toSource = getOpposite(toTarget);
        let sourceRoad = source.getRoad(toTarget);
        let targetRoad = target.getRoad(toSource);
        if ((!sourceRoad) || (!targetRoad)) {
            throw "road is missing for direction";
        }
        if (sourceRoad == targetRoad) {
            throw "road cannot connect to itself";
        }

        sourceRoad.connect(targetRoad);
        targetRoad.connect(sourceRoad);
        if (sourceRoad.isComplete()) {
            return sourceRoad;
        } else {
            return null;
        }
    }

}


