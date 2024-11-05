import Pos2D from "./Pos2D";
import EditSource from "./EditSource";

/**
 * Raytrace or pathing data generated during a simulation
 */
export default interface PathData2D {
    start: Pos2D;
    end: Pos2D;

    /** Simulation index, populated by redux during storage */
    index?: number;

    meta: PathData2DMeta;
}

/**
 * Context metadata about the path
 */
export interface PathData2DMeta {
    /** What type of end result did the path produce?
     * 'continue' means the path moved to the next position
     * 'done' means it hit some stopping limit
     * 'collision' means it hit a previous path and stopped
     * 'dead' means the path ran out of options
     *
     * Default is assumed to be 'continue' if undefined
     * */
    endType?: 'continue' | 'done' | 'collision' | 'dead'
    /** Energy left after processing the ray */
    energyLeft?: number;
    /** Energy cost of the ray step, usually this is the tile's energy cost with a modifier */
    energyCost?: number;
    /** Source of the path, populated by redux from {@link MapEdit2D} */
    source?: EditSource;
}