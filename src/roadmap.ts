
import { Direction, getOpposite, getRotated } from "./direction";
import { PlayerColour } from "./player";

export class Road {
    private d1: Direction;
    private d2: Direction;
    private meeple: PlayerColour;
    private connected: Road[] = [];
    private isEnd: boolean = false;
    private isFinished: boolean = false;
    private isVisited: boolean = false;
    private complete: boolean = false;

    constructor(d1: Direction, d2: Direction, meeple: PlayerColour) {
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

    public getMeeple(): PlayerColour {
        return this.meeple;
    }

    public rotate() {
        this.d1 = getRotated(this.d1);
        this.d2 = getRotated(this.d2);
    }

    private visit(callback: (r: Road) => void) {
        this.isVisited = true;
        callback(this);
        for (let r of this.connected) {
            if (!r.isVisited) {
                r.visit(callback);
            }
        }
    }

    private clear() {
        this.isVisited = false;
        for (let r of this.connected) {
            if (r.isVisited) {
                r.clear();
            }
        }
    }

    public isComplete(): boolean {
        return this.complete;
    }

    public updateComplete() {
        this.complete = true;
        this.visit((r: Road) => {
            if (!r.isFinished) {
                this.complete = false;
            }
        });
        this.clear();

        if (this.complete) {
            this.visit((r: Road) => { r.complete = true; });
            this.clear();
        }
    }

    public getScore(colour: PlayerColour): number {
        if (!this.complete) {
            return 0;
        }
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
        let meeples: PlayerColour[] = [];

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
                case 'R': meeples.push(PlayerColour.RED); break;
                case 'Y': meeples.push(PlayerColour.YELLOW); break;
                case 'G': meeples.push(PlayerColour.GREEN); break;
                case 'B': meeples.push(PlayerColour.BLUE); break;
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

    private addRoad(directions: Direction[], meeples: PlayerColour[]) {
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
            this.roads.push(new Road(directions[0], directions[1], PlayerColour.NONE));
        } else {
            this.roads.push(new Road(directions[0], directions[1], meeples[0]));
        }
    }

    private addEnd(direction: Direction) {
        // If a road is not present on the map, add a dead end
        if (this.getRoad(direction) == null) {
            this.roads.push(new Road(direction, Direction.END, PlayerColour.NONE));
        }
    }

    private getRoad(direction: Direction): Road | null {
        for (let r of this.roads) {
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
        for (let r of this.roads) {
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
        sourceRoad.updateComplete();
        if (sourceRoad.isComplete()) {
            return sourceRoad;
        } else {
            return null;
        }
    }

}


