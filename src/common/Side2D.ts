import Pos2D from "../api/Pos2D";
import {isDefined} from "../funcs/Helpers";

export type Side2D = 'north' | 'south' | 'west' | 'east';
export interface SidePos2D extends Pos2D {
    side: Side2D;
}
export const SIDES_2D: SidePos2D[] = [
    // UP - North
    {
        side: 'north',
        x: 0,
        y: -1
    },
    // DOWN - South
    {
        side: 'south',
        x: 0,
        y: 1
    },
    // LEFT - WEST
    {
        side: 'west',
        x: -1,
        y: 0
    },
    // RIGHT - EAST
    {
        side: 'east',
        x: 1,
        y: 0
    }
]

export function getSide2D(side: Side2D): SidePos2D {
    const value = SIDES_2D.find(s => s.side === side);
    if(!isDefined(value)) {
        throw new Error(`Failed to match ${side} to a side value`);
    }
    return value;
}