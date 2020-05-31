
export enum PlayerColour { RED, YELLOW, GREEN, BLUE, NONE };

export const MAX_SCORE = 8;

export class Player {

    private colour: PlayerColour;
    private score: number = 0;

    constructor(colour: PlayerColour) {
        this.colour = colour;
    }

    public getColour(): PlayerColour {
        return this.colour;
    }

    public addScore(s: number) {
        this.score += s;
    }

    public isWinner(): boolean {
        return this.score >= MAX_SCORE;
    }
}

