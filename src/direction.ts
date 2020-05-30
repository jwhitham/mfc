
export const enum Direction { NORTH, EAST, SOUTH, WEST, END };
import { ScreenXY } from "./xy";

export function opposite(d: Direction) {
    switch (d) {
        case Direction.NORTH: return Direction.SOUTH;
        case Direction.EAST:  return Direction.WEST;
        case Direction.SOUTH: return Direction.NORTH
        case Direction.WEST:  return Direction.EAST;
        default:              return Direction.END;
    }
}

export function rotate(d: Direction) {
    switch (d) {
        case Direction.NORTH: return Direction.EAST;
        case Direction.EAST:  return Direction.SOUTH;
        case Direction.SOUTH: return Direction.WEST;
        case Direction.WEST:  return Direction.NORTH;
        default:              return Direction.END;
    }
}

export function getVector(d: Direction,
                          magnitude: number): ScreenXY {
    let vx = 0;
    let vy = 0;
    switch (d) {
        case Direction.NORTH: vy = -magnitude; break;
        case Direction.SOUTH: vy = magnitude; break;
        case Direction.WEST:  vx = -magnitude; break;
        case Direction.EAST:  vx = magnitude; break;
        default:              break;
    }
    return new ScreenXY(vx, vy);
}

export function getRadians(d: Direction): number {
    switch (d) {
        case Direction.NORTH: return 0.0;
        case Direction.EAST:  return Math.PI * 0.5;
        case Direction.SOUTH: return Math.PI;
        case Direction.WEST:  return Math.PI * 1.5;
        default:              return 0.0;
    }
}
