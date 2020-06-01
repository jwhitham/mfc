
import { GridXY, ScreenXY } from "./xy";
import { TileSet } from "./tileset";
import { GameState } from "./gamestate";
import { GameView } from "./gameview";
import { FloatingButton } from "./floatingbutton";
import { ImageTracker } from "./imagetracker";
import { Player, PlayerColour } from "./player";
import { ScoreView } from "./scoreview";

const enum TurnState {
    AWAIT_MY_TURN,
    PLACE_THE_TILE,
    ROTATE_THE_TILE,
    END_OF_GAME,
};


export class MFCCanvas {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tileSet: TileSet;
    private gameState: GameState;
    private gameView: GameView;
    private turnState: TurnState = TurnState.PLACE_THE_TILE;
    private undrawPos: GridXY | null = null;
    private acceptButton: FloatingButton;
    private rotateButton: FloatingButton;
    private cancelButton: FloatingButton;
    private imageTracker: ImageTracker;
    private scoreCanvas: HTMLCanvasElement;
    private scoreContext: CanvasRenderingContext2D;
    private scoreView: ScoreView;


    constructor() {
        let canvas = document.getElementById('canvas1') as HTMLCanvasElement;
        let context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;

        this.scoreCanvas = document.getElementById('canvas2') as HTMLCanvasElement;
        this.scoreContext = this.scoreCanvas.getContext("2d") as CanvasRenderingContext2D;

        this.imageTracker = new ImageTracker(() => this.loadingComplete());
        this.tileSet = new TileSet(this.imageTracker);
        this.gameState = new GameState(this.tileSet);
        this.gameView = new GameView(this.gameState);
        this.scoreView = new ScoreView(this.gameState);
        let firstTile = this.gameState.getCurrentTile();
        if (firstTile) {
            firstTile.setPosition(new GridXY(0, 0));
        }
        this.gameState.addPlayer(new Player(PlayerColour.RED, "Miss Scarlett"));
        this.gameState.addPlayer(new Player(PlayerColour.GREEN, "Reverend Green"));
        this.gameState.addPlayer(new Player(PlayerColour.BLUE, "Mrs Peacock"));
        this.gameState.addPlayer(new Player(PlayerColour.YELLOW, "Colonel Mustard"));
        this.gameState.nextTile();

        this.acceptButton = new FloatingButton(this.imageTracker.request("accept.png"), this.gameView, -1, 1);
        this.rotateButton = new FloatingButton(this.imageTracker.request("rotate.png"), this.gameView, 0, 1);
        this.cancelButton = new FloatingButton(this.imageTracker.request("cancel.png"), this.gameView, 1, 1);
        this.imageTracker.start();
    }

    private loadingComplete() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", (e: MouseEvent) => this.pressEventHandler(e));
        canvas.addEventListener("mousemove", (e: MouseEvent) => this.dragEventHandler(e));

        canvas.addEventListener("touchstart", (e: TouchEvent) => this.pressEventHandler(e));
        canvas.addEventListener("touchmove", (e: TouchEvent) => this.dragEventHandler(e));

        window.addEventListener("resize", () => this.redraw(), false);
        this.redraw();
    }

    private redraw() {
        if (!this.imageTracker.isReady()) {
            return;
        }
        let context = this.context;
        let canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gameView.computeScale(context, canvas);
        this.gameView.drawAll(context);
        this.undrawPos = null;
        this.drawButtons(new ScreenXY(-100, -100));

        context = this.scoreContext;
        canvas = this.scoreCanvas;
        canvas.width = Math.floor(window.innerWidth * 0.2);
        canvas.height = window.innerHeight - 100;
        this.scoreView.computeScale(context, canvas);
        this.scoreView.drawScore(context);
    }

    private drawButtons(mouseXY: ScreenXY) {
        let context = this.context;
        let tile = this.gameState.getCurrentTile();

        switch (this.turnState) {
            case TurnState.ROTATE_THE_TILE:
                if (tile) {
                    this.rotateButton.setPosition(tile);
                    this.acceptButton.setPosition(tile);
                    this.cancelButton.setPosition(tile);
                }
                this.rotateButton.draw(context, mouseXY);
                this.acceptButton.draw(context, mouseXY);
                this.cancelButton.draw(context, mouseXY);
                break;
            default:
                this.rotateButton.remove();
                this.acceptButton.remove();
                this.cancelButton.remove();
                break;
        }
    }

    private getMousePos(e: MouseEvent | TouchEvent): ScreenXY {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        return new ScreenXY(mouseX, mouseY);
    }

    private pressEventHandler(e: MouseEvent | TouchEvent) {
        let xy = this.getMousePos(e);
        let pos = this.gameView.getGridXY(xy);
        let tile = this.gameState.getCurrentTile();

        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && pos && this.gameState.isValidPlacement(pos)) {
                    tile.setPosition(pos);
                    this.turnState = TurnState.ROTATE_THE_TILE;
                    this.redraw();
                }
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile && pos && this.rotateButton.intersect(xy)) {
                    tile.rotate();
                    this.redraw();
                } else if (tile && this.acceptButton.intersect(xy)) {
                    // finish placing
                    let gameOver = this.gameState.nextTile();
                    this.redraw();
                    if (!gameOver) {
                        this.turnState = TurnState.PLACE_THE_TILE;
                    } else {
                        this.turnState = TurnState.END_OF_GAME;
                    }
                } else if (tile && this.cancelButton.intersect(xy)) {
                    // unplace tile
                    tile.setPosition(null);
                    this.turnState = TurnState.PLACE_THE_TILE;
                    this.redraw();
                }
                break;
            default:
                break;
        }
    }

    private dragEventHandler(e: MouseEvent | TouchEvent) {
        let context = this.context;
        context.save();
        if (this.undrawPos) {
            this.gameView.drawAt(context, this.undrawPos);
        }
        let xy = this.getMousePos(e);
        let pos = this.gameView.getGridXY(xy);
        let tile = this.gameState.getCurrentTile();
        if (pos) {
            this.gameView.drawAt(context, pos);
        }
        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && pos && this.gameState.isValidPlacement(pos)) {
                    context.strokeStyle = "white";
                    this.gameView.drawHighlight(context, pos);
                } else if (pos) {
                    context.strokeStyle = "red";
                    this.gameView.drawHighlight(context, pos);
                }
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile) {
                    let tpos = tile.getPosition();
                    if (tpos) {
                        context.strokeStyle = "yellow";
                        this.gameView.drawHighlight(context, tpos);
                    }
                }
                break;
            default:
                break;
        }
        this.undrawPos = pos;
        this.drawButtons(xy);
        context.restore();
        e.preventDefault();
    }


}
