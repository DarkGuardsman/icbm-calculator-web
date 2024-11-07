import SimEntry2D from "./MapSimEntry2D";
import Pos2D from "./Pos2D";

export default interface Map2D<T> {
    data: {[y: number]: { [x: number]: T }};
    start: Pos2D;
    end: Pos2D;
}

export interface SimEntryMap2D extends Map2D<SimEntry2D[]> {}

export function initEdits(): SimEntryMap2D {
    return {
        data: {},
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        }
    }
}