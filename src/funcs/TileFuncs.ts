import {MapEdits2D} from "../api/Map2D";
import MapEdit2D from "../api/MapEdit2D";
import {addEdit} from "../data/map/tileMap";

/**
 * Populates edits into a map from start to end
 * @param map
 * @param startX
 * @param startY
 * @param width
 * @param height
 * @param tileIdGetter
 */
export function fillTiles(map: MapEdits2D, startX: number, startY :number, width: number, height: number, tileIdGetter: (x:number, y:number) => MapEdit2D) {
    for (let y = startY; y < width + startY; y++) {
        for (let x = startX; x < height + startX; x++) {
            addEdit(map, tileIdGetter(x, y));
        }
    }
}