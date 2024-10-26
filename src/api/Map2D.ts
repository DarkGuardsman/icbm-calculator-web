import MapEdit2D from "./MapEdit2D";
import Pos2D from "./Pos2D";

export default interface Map2D<T> {
    data: {[y: number]: { [x: number]: T }};
    start: Pos2D;
    end: Pos2D;
}

export interface TileMap2D extends Map2D<number> {}
export interface MapEdits2D extends Map2D<MapEdit2D[]> {}

export function initEdits(): MapEdits2D {
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