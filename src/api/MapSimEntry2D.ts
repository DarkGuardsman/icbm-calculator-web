import PathData2D from "./PathData2D";
import EditSource from "./EditSource";

/**
 * Instance of an action taken in the simulation.
 *
 * It is possible for more than one entry to exist per x-y grid position. Especially for less efficient algs.
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
        /** Source information for the edit */
        source: EditSource,
        /** Information about path taken during this edit */
        path?: PathData2D;
    }
}

