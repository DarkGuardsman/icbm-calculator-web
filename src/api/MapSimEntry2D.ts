import PathData2D from "./PathData2D";
import EditSource from "./EditSource";
import {TileMapCell2D} from "./TileMap2D";

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

    /**
     * Edit to be applied, try to apply only 1 attribute set at a time. This will help track changes
     * better and show actions being taken. Especially in events were energy values are being changed.
     *
     * Exception to this is if previous value is being replaced completely. Such as when a tile is placed into
     * the world.
     */
    edit? : MapSimEdit2D;

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

export interface MapSimEdit2D {
    /**
     * How to apply the edit to previous edit.
     *
     * 'add' and 'subtract' only works with numeric fields
     *
     * 'undefined' will be considered 'override'
     * */
    action?: 'add' | 'subtract' | 'override';

    /** ID of the tile to place. Required to apply change, leave off to pass through pathing data */
    newTile?: TileMapCell2D;

    /** ID of the tile previously */
    oldTile?: TileMapCell2D;
}

