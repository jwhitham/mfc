
import { GridXY, ScreenXY } from "./xy";
import { TileSet } from "./tileset";
import { GameState } from "./gamestate";
import { GameView } from "./gameview";
import { FloatingButton } from "./floatingbutton";

enum TurnState {
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


    constructor() {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;
        this.tileSet = new TileSet();
        this.gameState = new GameState(this.tileSet);
        this.gameView = new GameView(this.gameState);
        let firstTile = this.gameState.getCurrentTile();
        if (firstTile) {
            firstTile.pos = new GridXY(0, 0);
        }
        this.gameState.nextTile();

        this.acceptButton = new FloatingButton("accept.png", this.gameView, -1, 1);
        this.rotateButton = new FloatingButton("rotate.png", this.gameView, 0, 1);
        this.cancelButton = new FloatingButton("cancel.png", this.gameView, 1, 1);

        this.createUserEvents();
        this.redraw();
    }

    private createUserEvents() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", (e: MouseEvent) => this.pressEventHandler(e));
        canvas.addEventListener("mousemove", (e: MouseEvent) => this.dragEventHandler(e));

        canvas.addEventListener("touchstart", (e: TouchEvent) => this.pressEventHandler(e));
        canvas.addEventListener("touchmove", (e: TouchEvent) => this.dragEventHandler(e));

        window.addEventListener("resize", () => this.redraw(), false);
    }

    private redraw() {
        let context = this.context;
        let canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gameView.computeScale(canvas.width, canvas.height);
        this.gameView.drawAll(context);
        this.undrawPos = null;
        this.drawButtons(new ScreenXY(-100, -100));
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
                if (tile && this.gameState.isValidPlacement(pos)) {
                    tile.pos = pos;
                    this.turnState = TurnState.ROTATE_THE_TILE;
                    this.redraw();
                }
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile && this.rotateButton.intersect(xy)) {
                    tile.rotation = (tile.rotation + 1) % 4;
                    this.redraw();
                } else if (tile && this.acceptButton.intersect(xy)) {
                    // finish placing
                    this.gameState.nextTile();
                    this.redraw();
                    tile = this.gameState.getCurrentTile();
                    if (tile) {
                        this.turnState = TurnState.PLACE_THE_TILE;
                    } else {
                        this.turnState = TurnState.END_OF_GAME;
                    }
                } else if (tile && this.cancelButton.intersect(xy)) {
                    // unplace tile
                    tile.pos = null;
                    this.turnState = TurnState.PLACE_THE_TILE;
                    this.redraw();
                }
                break;
            default:
                break;
        }
    }

    private dragEventHandler(e: MouseEvent | TouchEvent) {
        if (this.undrawPos) {
            this.gameView.drawAt(this.context, this.undrawPos);
        }
        let xy = this.getMousePos(e);
        let pos = this.gameView.getGridXY(xy);
        let tile = this.gameState.getCurrentTile();
        this.gameView.drawAt(this.context, pos);
        switch (this.turnState) {
            case TurnState.PLACE_THE_TILE:
                if (tile && this.gameState.isValidPlacement(pos)) {
                    this.context.strokeStyle = "white";
                } else {
                    this.context.strokeStyle = "red";
                }
                this.gameView.drawHighlight(this.context, pos);
                break;
            case TurnState.ROTATE_THE_TILE:
                if (tile && tile.pos) {
                    this.context.strokeStyle = "yellow";
                    this.gameView.drawHighlight(this.context, tile.pos);
                }
                break;
            default:
                break;
        }
        this.undrawPos = pos;
        this.drawButtons(xy);
        e.preventDefault();
    }


}
