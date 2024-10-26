import RayData2D from "./RayData2D";

export default interface MapEdit2D {
    /** Grid position x, whole number */
    x: number;
    /** Grid position y, whole number */
    y: number;

    /** ID of the tile to place */
    id: number;

    /** nth edit since simulation started */
    index: number;

    /** Information about why/how the edit was made */
    meta: {
        /** Source information for the edit */
        source: {
            /** Unique id of the source, Ex: 'TNT-45' */
            key: string;
            /** Unique timeline key for the source, Ex: 'ray-1' */
            phase: string;
            /** nth edit of the source since it started simulation, should ignore phase. Used for timeline scrubbing and playback */
            index: number;
        },
        /** Information about raytrace that passed through this edit */
        ray?: RayData2D;
    }
}