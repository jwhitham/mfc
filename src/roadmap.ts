
export enum Direction { NORTH, EAST, SOUTH, WEST };
export enum Player { RED, YELLOW, GREEN, BLUE };

export class Road {
    public d1: Direction;
    public d2: Direction;
    public meeples: Player[];

    constructor(d1: Direction, d2: Direction, meeples: Player[]) {
        this.d1 = d1;
        this.d2 = d2;
        this.meeples = meeples;
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

    public getRoads(): Road[] {
        return this.roads;
    }

    public link(direction: Direction, target: Roadmap) {
        switch (direction) {
            case Direction.NORTH: opposite = Direction.SOUTH; break;
            case Direction.SOUTH: opposite = Direction.NORTH; break;
        }
        for (let i = 0; i < this.roads.length; i++) {
            let sourceRoad = this.roads[i];
            if ((sourceRoad.d1 == direction) || (sourceRoad.d2 == direction)) {
                // there's a road to the target tile
                for (let j = 0; j < target.roads.length; j++) {
                    let targetRoad = this.roads[i];
                    if ((targetRoad.d1 == opposite) || (targetRoad.d2 == opposite)) {
                        // there's a road from the target tile
                    }
                }

            }
        }
    }

}


