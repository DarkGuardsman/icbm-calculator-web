import Pos2D from "./Pos2D";
import EditSource from "./EditSource";

/**
 * Raytrace or pathing data generated during a simulation
 */
export default interface PathData2D {
    start: Pos2D;
    end: Pos2D;
    meta: PathData2DMeta;
}

/**
 * Context metadata about the path
 */
export interface PathData2DMeta {
    /** Energy left after processing the ray */
    energyLeft?: number;
    /** Energy cost of the ray step, usually this is the tile's energy cost with a modifier */
    energyCost?: number;
    /** Source of the path, populated by redux from {@link MapEdit2D} */
    source?: EditSource;
}