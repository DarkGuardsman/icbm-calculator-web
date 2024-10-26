import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {isDefined, valueOr} from "../../funcs/Helpers";
import {TILE_AIR, TILE_ID_TO_OBJ} from "../../common/Tiles";
import MapEdit2D from "../../api/MapEdit2D";
import Map2D, {MapEdits2D, TileMap2D} from "../../api/Map2D";

export interface TileMapState {
    tiles: TileMap2D;
}

const initialState: TileMapState = {
    tiles: {
        data: {},
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        }
    }
}

export const tileMapSlice = createSlice({
    name: 'tiles',
    initialState,
    reducers: {
        applyMapEdit: (state: TileMapState, action: PayloadAction<MapEdit2D>) => applyEdit(state, action.payload),
        applyMapEdits: (state: TileMapState, action: PayloadAction<MapEdits2D>) => {
            const editMap = action.payload;

            state.tiles = {
                data: {...state.tiles.data},
                start: {
                    x: Math.min(state.tiles.start.x, editMap.start.x),
                    y: Math.min(state.tiles.start.y, editMap.start.y)
                },
                end: {
                    x: Math.max(state.tiles.end.x, editMap.end.x),
                    y: Math.max(state.tiles.end.y, editMap.end.y)
                },
            };

            const tiles = state.tiles.data;
            const edits = editMap.data;
            Object.keys(edits)
                .forEach(yKey => {
                    const y = yKey as unknown as number;
                    tiles[y] = {...tiles[y]};

                    Object.keys(edits[y]).forEach(xKey => {
                        const x = xKey as unknown as number;
                        if (edits[y][x]?.length > 0) {
                            tiles[y][x] = edits[y][x][edits[y][x].length - 1].id;
                        }
                    });
                });
        },
        clearTiles: (state) => {
            state.tiles = {
                data: {},
                start: {
                    x: 0,
                    y: 0
                },
                end: {
                    x: 0,
                    y: 0
                }
            };
        }
    }
});

function applyEdit(state: TileMapState, edit: MapEdit2D) {
    const {x, y, id} = edit;
    const newTiles = {...state.tiles};
    setTileData(x, y, id, newTiles);
    state.tiles = newTiles;
}

/**
 * Adds an edit to the map via mutations... isn't state update safe
 *
 * @param map to mutate
 * @param edit to store
 */
export function addEdit(map: MapEdits2D, edit: MapEdit2D) {

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

export const {applyMapEdit, applyMapEdits, clearTiles} = tileMapSlice.actions;

export const selectTiles = (state: RootState) => state.tiles.tiles;

export default tileMapSlice.reducer;