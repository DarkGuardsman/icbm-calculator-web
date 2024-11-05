import Map2D, {SimEntryMap2D, TileMap2D} from "../api/Map2D";
import MapSimEntry2D from "../api/MapSimEntry2D";
import {isDefined, valueOr} from "./Helpers";
import {TILE_AIR, TILE_ID_TO_OBJ} from "../common/Tiles";

/**
 * Adds an edit to the map via mutations... isn't state update safe
 *
 * @param map to mutate
 * @param edit to store
 */
export function addSimEntry(map: SimEntryMap2D, edit: MapSimEntry2D) {

    // no y
    if (!isDefined(map.data[edit.y])) {
        map.data[edit.y] = {
            [edit.x]: [edit]
        }
    }
    // existing x
    else if (isDefined(map.data[edit.y][edit.x])) {
        map.data[edit.y][edit.x].push(edit);
    }
    // new x
    else {
        map.data[edit.y][edit.x] = [edit];
    }

    map.start.x = Math.min(map.start.x, edit.x);
    map.start.y = Math.min(map.start.y, edit.y);
    map.end.x = Math.max(map.end.x, edit.x);
    map.end.y = Math.max(map.end.y, edit.y);
}

export function map2DContainsPos<T>(map: Map2D<T>, x: number, y: number) {
    return isDefined(map?.data) && isDefined(map.data[y]) && isDefined(map.data[y][x]);
}

export function setTileData<T>(x: number, y: number, data: T, map: Map2D<T>) {
    if (!isDefined(map.data[y])) {
        map.data[y] = {
            [x]: data
        };
    } else {
        map.data[y] = {
            ...map.data[y],
            [x]: data
        };
    }

    map.start = {
        x: Math.min(map.start.x, x),
        y: Math.min(map.start.y, y)
    };
    map.end = {
        x: Math.max(map.end.x, x),
        y: Math.max(map.end.y, y)
    };
}

export function getTileData<T>(x: number, y: number, grid: Map2D<T>) {
    if (isDefined(grid.data[y])) {
        return grid.data[y][x];
    }
    return undefined;
}

export function getTileId(x: number, y: number, grid: TileMap2D): number {
    if (isDefined(grid.data[y])) {
        return valueOr(grid.data[y][x], TILE_AIR.index);
    }
    return TILE_AIR.index;
}

export function getTile(x: number, y: number, grid: TileMap2D) {
    return TILE_ID_TO_OBJ[getTileId(x, y, grid)];
}

/**
 * Populates edits into a map from start to end
 * @param map
 * @param startX
 * @param startY
 * @param width
 * @param height
 * @param tileIdGetter
 */
export function fillTiles(map: SimEntryMap2D, startX: number, startY :number, width: number, height: number, tileIdGetter: (x:number, y:number) => MapSimEntry2D) {
    for (let y = startY; y < width + startY; y++) {
        for (let x = startX; x < height + startX; x++) {
            addSimEntry(map, tileIdGetter(x, y));
        }
    }
}