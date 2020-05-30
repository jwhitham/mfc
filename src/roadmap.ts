
export enum Direction { NORTH, EAST, SOUTH, WEST, END };
export enum Player { RED, YELLOW, GREEN, BLUE };

export class Road {
    private d1: Direction;
    private d2: Direction;
    private meeples: Player[];
    private connected: Road[] = [];
    private isEnd: boolean = false;
    private isFinished: boolean = false;
    private isVisited: boolean = false;

    constructor(d1: Direction, d2: Direction, meeples: Player[]) {
        this.d1 = d1;
        this.d2 = d2;
        this.meeples = meeples;
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
            }
        } else {
            if (this.connected.length == 2) {
                this.isFinished = true;
            }
        }
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
            for (let i = 0; i < r.meeples.length; i++) {
                if (colour == r.meeples[i]) {
                    score ++;
                }
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
        this.roads.push(new Road(directions[0], directions[1], meeples));
    }

    private addEnd(direction: Direction) {
        // If a road is not present on the map, add a dead end
        if (this.getRoad(direction) == null) {
            this.roads.push(new Road(direction, Direction.END, []));
        }
    }

    public getRoad(direction: Direction): Road | null {
        for (let i = 0; i < this.roads.length; i++) {
            let r = this.roads[i];
            if (r.hasDirection(direction)) {
                return r;
            }
        }
        return null;
    }

    public link(toTarget: Direction, target: Roadmap): Road {

        let source = this;
        let toSource = Direction.NORTH;
        switch (toTarget) {
            case Direction.NORTH: toSource = Direction.SOUTH; break;
            case Direction.SOUTH: toSource = Direction.NORTH; break;
            case Direction.WEST:  toSource = Direction.EAST; break;
            case Direction.EAST:  toSource = Direction.WEST; break;
            default:              throw "invalid direction"; break;
        }

        let sourceRoad = source.getRoad(toTarget);
        let targetRoad = target.getRoad(toSource);
        if ((!sourceRoad) || (!targetRoad)) {
            throw "road is missing for direction";
        }

        sourceRoad.connect(targetRoad);
        return sourceRoad;
    }

}


