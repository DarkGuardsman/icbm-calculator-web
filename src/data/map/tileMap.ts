import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {getLastValue, isDefined, sortNum} from "../../funcs/Helpers";
import MapSimEntry2D from "../../api/MapSimEntry2D";
import Map2D, {SimEntryMap2D, TileMap2D} from "../../api/Map2D";
import PathData2D from "../../api/PathData2D";
import {getTileData, loopMapEntries, setTileData} from "../../funcs/TileFuncs";

export interface TileMapState {
    /** Tiles to render on the grid */
    tiles: TileMap2D;

    // TODO move to different slices that share the same reducer key (separation of concerns)
    /** Array of paths taken by the simulation */
    paths: PathData2D[];

    /** Number of path end points at a given point */
    pathHeat: Map2D<number>;

    /** Edit data, used for timeline playback and scrubbing */
    edits: {
        /** Edits applied to map, sorted by index */
        entries: MapSimEntry2D[];
        /** Edit phase to first index it shows */
        bookmarks: EditTimelineBookmark[];
        /** Largest edit index value */
        maxIndex: number;
    };
}

export interface EditTimelineBookmark {
    type: 'source' | 'phase';
    key: string;
    index: number;
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
    pathHeat: {
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
    edits: {
        entries: [],
        bookmarks: [],
        maxIndex: 0
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
            state.tiles = mergeEdits<number>(state.tiles, editMap,
                (edit) => isDefined(edit?.edit?.newTile),
                (edits) => getLastValue(edits, (edit) => edit?.edit?.newTile)
            );

            state.paths = collectPaths(state.paths, editMap);

            state.pathHeat = mergeEdits<number>(state.pathHeat, editMap,
                (edit) => isDefined(edit?.meta?.path),
                (edits, prev) => (prev ?? 0) + edits.filter(e => isDefined(e.meta.path)).length
            );

            // Convert edits into array for easy playback
            const editArray = [...state.edits.entries];
            loopMapEntries(editMap, (entries) => {
                entries.forEach(e => {
                    editArray.push(e);
                    if (!isDefined(e.index)) {
                        console.error("missing index, will cause playback issues", e)
                    }
                });
            });

            // Capture bookmarks by using phase
            const bookmarks: { [key: string]: EditTimelineBookmark } = {};
            editArray.forEach(e => {
                const sourceKey = e.meta?.source?.key;
                const phaseKey = e.meta?.source?.phase;
                if (isDefined(sourceKey)) {

                    // Add bookmark for source start
                    if (!isDefined(bookmarks[sourceKey])) {
                        bookmarks[sourceKey] = {
                            index: e.index,
                            key: sourceKey,
                            type: 'source'
                        };
                    }

                    if (isDefined(phaseKey)) {
                        const key = sourceKey + ":" + phaseKey;
                        // Add bookmark for phase
                        if (!isDefined(bookmarks[key])) {
                            bookmarks[key] = {
                                index: e.index,
                                key,
                                type: 'phase'
                            };
                        }
                    }
                }
            });

            // Sort index entries and store updates
            editArray.sort((a, b) => sortNum(a.index, b.index));
            state.edits = {
                bookmarks: Object.values(bookmarks).sort((a, b) => sortNum(a.index, b.index)),
                maxIndex: editArray.length > 0 ? editArray[editArray.length - 1].index : 0,
                entries: editArray
            }
        },
        selectEditIndex: (state, action: PayloadAction<number>) => {
            //TODO use edit array to create a new edit map
            //          use edit map to generate tiles, paths, and heat

            //TODO if moving forward small amounts attempt to play next edit or undo last edit to reduce recalculation delay
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
            state.edits = {
                entries: [],
                bookmarks: [],
                maxIndex: 0
            };
            state.pathHeat = {
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
    }
});

function collectPaths(existingPaths: PathData2D[], editMap: SimEntryMap2D) {

    const paths = [...existingPaths];
    loopMapEntries(editMap, (values) => {
        values.forEach(edit => {
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
    });
    return paths;
}

function mergeEdits<T>(oldMap: Map2D<T>, editMap: SimEntryMap2D, validator: (edit: MapSimEntry2D) => boolean, dataAccessor: (edits: MapSimEntry2D[], prev: T) => T | undefined): Map2D<T> {
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
                const tileSimEntries = getTileData(x, y, editMap)?.filter((e) => validator(e));
                if (isDefined(tileSimEntries) && tileSimEntries.length > 0) {
                    const valueToSet = dataAccessor(tileSimEntries, tiles[y][x]);
                    if (isDefined(valueToSet)) {
                        tiles[y][x] = valueToSet;
                    }
                }
            });
        });
    return newMap;
}

function applyEdit(state: TileMapState, simEntry: MapSimEntry2D) {
    const {x, y, edit} = simEntry;
    const newTile = edit?.newTile;
    if (isDefined(newTile)) {
        const newTiles = {...state.tiles};
        setTileData(x, y, newTile, newTiles);
        state.tiles = newTiles;
    }
}

export const {applySimEntry, applySimEntries, clearTiles} = tileMapSlice.actions;

export const selectTiles = (state: RootState) => state.map2D.tiles;
export const selectPaths = (state: RootState) => state.map2D.paths;
export const selectPathHeat = (state: RootState) => state.map2D.pathHeat;

export default tileMapSlice.reducer;