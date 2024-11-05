import Pos2D from "../api/Pos2D";
import {isDefined} from "../funcs/Helpers";

export function addPos2D(a: Pos2D, b: Pos2D): Pos2D {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}

/**
 * Checks if two positions are equal
 *
 * @param a pos
 * @param b pos
 * @param precision to approximate similar to deal with precision lose of floating points
 */
export function pos2DEquals(a: Pos2D, b: Pos2D, precision?: number) {
    return a === b
        || (a.x === b.x && a.y === b.y)
        || (isDefined(precision) && Math.abs(a.x - b.x) < precision && Math.abs(a.y - b.y) < precision);
}