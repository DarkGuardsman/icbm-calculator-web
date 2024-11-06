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
     *
     * This mostly changes the line color and end cap visual
     * */
    endType?: 'continue' | 'done' | 'collision' | 'dead'
    /**
     * What type of result was recorded as part of the path
     *
     * 'hit' means we collided with something but did nothing (ex: ran out of energy)
     * 'action' means some change was made on the map as a result of the path (ex: tile removed)
     * 'ignore' means the position was skipped (ex: out of range)
     *
     * This changes what type of node is drawn at the end position
     */
    nodeType? : 'hit' | 'action' | 'ignore',
    /**
     * Which end of the ray is the node or action position
     *
     * 'start' will use {@link PathData2D#start}
     * 'end' will use {@link PathData2D#end}
     * Default is end
     */
    nodePos? : 'start' | 'end',
    /** Energy left after processing the ray */
    energyLeft?: number;
    /** Energy cost of the ray step, usually this is the tile's energy cost with a modifier */
    energyCost?: number;
    /** Source of the path, populated by redux from {@link MapEdit2D} */
    source?: EditSource;
}