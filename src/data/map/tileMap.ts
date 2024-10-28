import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {isDefined} from "../../funcs/Helpers";
import MapSimEntry2D from "../../api/MapSimEntry2D";
import Map2D, {SimEntryMap2D, TileMap2D} from "../../api/Map2D";
import PathData2D from "../../api/PathData2D";
import {getTileData, setTileData} from "../../funcs/TileFuncs";

export interface TileMapState {
    tiles: TileMap2D;

    // TODO move to different slices that share the same reducer key (separation of concerns)
    paths: PathData2D[];
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
    },
    paths: []
}

export const tileMapSlice = createSlice({
    name: 'tiles',
    initialState,
    reducers: {
        applySimEntry: (state: TileMapState, action: PayloadAction<MapSimEntry2D>) => applyEdit(state, action.payload),
        applySimEntries: (state: TileMapState, action: PayloadAction<SimEntryMap2D>) => {
            const editMap = action.payload;
            state.tiles = mergeEdits<number>(state.tiles, editMap, (edits) => [...edits].reverse().find(e => isDefined(e?.edit?.newTile))?.edit?.newTile); //TODO write custom function to walk backwards
            state.paths = collectPaths(state.paths, editMap);

            console.log(editMap, state.tiles, state.paths);
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
            state.paths = [];
        }
    }
});

function collectPaths(existingPaths: PathData2D[], editMap: SimEntryMap2D) {

    const paths = [...existingPaths];
    const edits = editMap.data;
    Object.keys(edits)
        .forEach(yKey => {
            const y = yKey as unknown as number;

            Object.keys(edits[y]).forEach(xKey => {
                const x = xKey as unknown as number;
                if (edits[y][x]?.length > 0) {
                    const edits = getTileData(x, y, editMap);
                    if (isDefined(edits)) {
                        edits
                            .forEach(edit => {
                                const path = edit.meta?.path
                                if (isDefined(path)) {
                                    paths.push({
                                        ...path,
                                        index: edit.index,
                                        //TODO add simEditIndex for sorting
                                        meta: {
                                            ...path.meta,
                                            source: edit.meta.source
                                        }
                                    })
                                }
                            })
                    }
                }
            });
        });

    return paths;
}

function mergeEdits<T>(oldMap: Map2D<T>, editMap: SimEntryMap2D, dataAccessor: (edits: MapSimEntry2D[]) => T|undefined): Map2D<T> {
    const newMap = {
        data: {...oldMap.data},
        start: {
            x: Math.min(oldMap.start.x, editMap.start.x),
            y: Math.min(oldMap.start.y, editMap.start.y)
        },
        end: {
            x: Math.max(oldMap.end.x, editMap.end.x),
            y: Math.max(oldMap.end.y, editMap.end.y)
        },
    };

    const tiles = newMap.data;
    const edits = editMap.data;
    Object.keys(edits)
        .forEach(yKey => {
            const y = yKey as unknown as number;
            tiles[y] = {...tiles[y]};

            Object.keys(edits[y]).forEach(xKey => {
                const x = xKey as unknown as number;
                if (edits[y][x]?.length > 0) {
                    const edits = getTileData(x, y, editMap);
                    if (isDefined(edits)) {
                        const valueToSet = dataAccessor(edits);
                        if(isDefined(valueToSet)) {
                            tiles[y][x] = valueToSet;
                        }
                    }
                }
            });
        });
    return newMap;
}

function applyEdit(state: TileMapState, simEntry: MapSimEntry2D) {
    const {x, y, edit} = simEntry;
    const newTile = edit?.newTile;
    if(isDefined(newTile)) {
        const newTiles = {...state.tiles};
        setTileData(x, y, newTile, newTiles);
        state.tiles = newTiles;
    }
}

export const {applySimEntry, applySimEntries, clearTiles} = tileMapSlice.actions;

export const selectTiles = (state: RootState) => state.map2D.tiles;
export const selectPaths = (state: RootState) => state.map2D.paths;

export default tileMapSlice.reducer;