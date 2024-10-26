import Pos2D from "./Pos2D";

export default interface RayData2D {
    start: Pos2D;
    end: Pos2D;
    meta?: {
        /** Energy left after processing the ray */
        energyLeft?: number;
        /** Energy cost of the ray step, usually this is the tile's energy cost with a modifier */
        energyCost?: number;
    }
}