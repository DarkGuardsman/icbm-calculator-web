import Pos2D from "../api/Pos2D";

export const CHUNK_SIZE: number = 16;

export const SIDES_2D: Pos2D[] = [
    // UP - North
    {
        x: 0,
        y: -1
    },
    // DOWN - South
    {
        x: 0,
        y: 1
    },
    // LEFT - WEST
    {
        x: -1,
        y: 0
    },
    // RIGHT - EAST
    {
        x: 1,
        y: 0
    }
]