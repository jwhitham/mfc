
export enum PlayerColour { RED, YELLOW, GREEN, BLUE, NONE };

export const MAX_SCORE = 8;

export class Player {

    private colour: PlayerColour;
    private score: number = 0;
    private name: string;

    constructor(colour: PlayerColour, name: string) {
        this.colour = colour;
        this.name = name;
    }

    public getColour(): PlayerColour {
        return this.colour;
    }

    public addScore(s: number) {
        this.score += s;
    }

    public getName(): string {
        return this.name;
    }

    public getScore(): number {
        return this.score;
    }

    public isWinner(): boolean {
        return this.score >= MAX_SCORE;
    }
}

