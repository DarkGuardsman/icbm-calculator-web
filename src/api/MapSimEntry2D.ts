import PathData2D from "./PathData2D";
import EditSource from "./EditSource";

/**
 * Instance of an action taken in the simulation. Actions are not always changed to the map space. Often
 * this is used ot track metadata information about the simulation. Such as raytrace steps, energy being
 * consumed, or calculations being run. More so each grid location may contain several actions taken. Especially
 * in cases of less efficient algorithms that path the same grid multiple times.
 */
export default interface MapSimEntry2D {
    /** Grid position x, whole number */
    x: number;
    /** Grid position y, whole number */
    y: number;

    /** nth entry since simulation started */
    index: number;

    /** Defined if an edit should be done */
    edit? : {
        /** ID of the tile to place. Required to apply change, leave off to pass through pathing data */
        newTile?: number;

        /** ID of the tile previously */
        oldTile?: number;
    }

    /** Information about why/how the edit was made */
    meta: {
        /** Number of times the map data was accessed  */
        mapAccessCount?: number;
        /** Source information for the edit */
        source: EditSource,
        /** Information about path taken during this edit */
        path?: PathData2D;
    }
}

