import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {addNum, firstDefined, isDefined, sortNum, subtractNum} from "../../funcs/Helpers";
import MapSimEntry2D from "../../api/MapSimEntry2D";
import Map2D, {initEdits, SimEntryMap2D} from "../../api/Map2D";
import PathData2D from "../../api/PathData2D";
import {addSimEntry, getTileGridData, loopMapEntries, setTileData} from "../../funcs/TileFuncs";
import {TileMap2D, TileMapCell2D} from "../../api/TileMap2D";

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
        bookmarks: EditTimelineSource[];
        /** Largest edit index value */
        maxIndex: number;
        currentIndex: number;
    };
}

export interface EditTimelineSource {
    label: string;
    index: number;
    entries: EditTimelineBookmark[]
}

export interface EditTimelineBookmark {
    label: string;
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
        currentIndex: 0,
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

            applyEditMap(state, editMap);

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
            editArray.sort((a, b) => sortNum(a.index, b.index));

            // Capture bookmarks by using phase
            const sourceToBookmarks: {
                [key: string]: {
                    index: number;
                    label: string;
                    entries: { [key: string]: EditTimelineBookmark }
                }
            } = {};
            editArray.forEach(e => {
                const sourceKey = e.meta?.source?.key;
                const phaseKey = e.meta?.source?.phase;
                if (isDefined(sourceKey)) {

                    // Add bookmark for source start
                    if (!isDefined(sourceToBookmarks[sourceKey])) {
                        sourceToBookmarks[sourceKey] = {
                            index: e.index,
                            label: sourceKey,
                            entries: {}
                        };
                    } else {
                        sourceToBookmarks[sourceKey].index = e.index;
                    }

                    if (isDefined(phaseKey)) {
                        // Add bookmark for phase
                        if (!isDefined(sourceToBookmarks[sourceKey].entries[phaseKey])) {
                            sourceToBookmarks[sourceKey].entries[phaseKey] = {
                                index: e.index,
                                label: phaseKey
                            };
                        } else {
                            sourceToBookmarks[sourceKey].entries[phaseKey].index = e.index;
                        }
                    }
                }
            });

            const bookmarkArray: EditTimelineSource[] = Object.values(sourceToBookmarks).map(s => {
                return {
                    label: s.label,
                    index: s.index,
                    entries: Object.values(s.entries).sort((a, b) => sortNum(a.index, b.index))
                }
            }).sort((a, b) => sortNum(a.index, b.index));

            state.edits = {
                bookmarks: bookmarkArray,
                maxIndex: editArray.length > 0 ? editArray[editArray.length - 1].index : 0,
                currentIndex: editArray.length > 0 ? editArray[editArray.length - 1].index : 0,
                entries: editArray
            }
        },
        selectNextEdit: (state) => {
            if (state.edits.currentIndex < state.edits.maxIndex) {
                updateEditIndex(state, state.edits.currentIndex + 1);
            }
        },
        selectEditIndex: (state, action: PayloadAction<number>) => {
            updateEditIndex(state, action.payload);

            //TODO if moving forward small amounts attempt to play next edit or undo last edit to reduce recalculation delay
        },
        clearTiles: (state) => {
            state.edits = {
                entries: [],
                bookmarks: [],
                maxIndex: 0,
                currentIndex: 0
            };
            clearEditData(state);
        }
    }
});

function updateEditIndex(state: TileMapState, index: number) {
    state.edits = {
        ...state.edits,
        currentIndex: index
    };
    clearEditData(state);

    // Build new edit map
    const editMap = initEdits();
    state.edits.entries
        .filter(e => e.index <= state.edits.currentIndex)
        .forEach(e => {
            addSimEntry(editMap, e);
        });

    // Apply map
    applyEditMap(state, editMap);
}

function clearEditData(state: TileMapState) {
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

function applyEditMap(state: TileMapState, editMap: SimEntryMap2D) {
    state.tiles = mergeEdits(state.tiles, editMap,
        (edit) => isDefined(edit?.edit?.newTile),
        (edits) => mergeDownTileData(edits)
    );

    state.paths = collectPaths(state.paths, editMap);

    state.pathHeat = mergeEdits<number>(state.pathHeat, editMap,
        (edit) => isDefined(edit?.meta?.path),
        (edits, prev) => (prev ?? 0) + edits.filter(e => isDefined(e.meta.path)).length
    );
}

function mergeDownTileData(edits: MapSimEntry2D[]): TileMapCell2D | undefined {
    if (!isDefined(edits) || edits.length === 0) {
        return undefined;
    }
    return edits
        .map(e => e?.edit)
        .filter(e => isDefined(e))
        .reduce((currentEdit, nextEdit) => {
            const nextValue = nextEdit?.newTile;
            if (!isDefined(nextValue)) {
                return currentEdit;
            }
            else if(!isDefined(currentEdit))
            {
                return {};
            }
            else if(!isDefined(currentEdit?.newTile)) {
                currentEdit.newTile = {};
            }

            // Case 1 - id changed >> clear data and set new id
            // Case 2 - id is empty >> do nothing, may be an attribute value change only (ex: remove energy)
            if(isDefined(nextValue.tile) && currentEdit.newTile.tile !== nextValue.tile) {
                currentEdit.newTile.tile = nextValue.tile ?? currentEdit.newTile.tile;
                currentEdit.newTile.data = {};
                return currentEdit;
            }
            // Case 3 - current id is empty >> do nothing, attributes require tiles
            else if(!isDefined(currentEdit.newTile.tile)) {
                console.error('Attempted to apply attributes to a null tile id.', currentEdit, nextEdit, edits);
                return currentEdit;
            }

            // Merge tile data if our ids match
            const nextData = nextValue.data;
            if(isDefined(nextData)) {
                const currentData = currentEdit.newTile.data;
                if(!isDefined(currentData)) {
                    currentEdit.newTile.data = {...nextValue.data};
                    return currentEdit;
                }

                currentData.facing = nextValue?.data?.facing ?? currentData.facing;

                if(nextEdit?.action === 'add') {
                    currentData.energyHeat = addNum(currentData.energyHeat, nextData?.energyHeat);
                    currentData.energyPower = addNum(currentData.energyPower, nextData?.energyPower);
                }
                else if(nextEdit?.action === 'subtract') {
                    currentData.energyHeat = subtractNum(currentData.energyHeat, nextData?.energyHeat);
                    currentData.energyPower = subtractNum(currentData.energyPower, nextData?.energyPower);
                }
                else {
                    currentData.energyHeat = firstDefined(currentData.energyHeat, nextData?.energyHeat);
                    currentData.energyPower = firstDefined(currentData.energyPower, nextData?.energyPower);
                }
            }

            return currentEdit;
        }, {})?.newTile;
}

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
                const tileSimEntries = getTileGridData(x, y, editMap)?.filter((e) => validator(e));
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

export const {applySimEntry, applySimEntries, clearTiles, selectEditIndex, selectNextEdit} = tileMapSlice.actions;

export const selectTiles = (state: RootState) => state.map2D.tiles;
export const selectPaths = (state: RootState) => state.map2D.paths;
export const selectPathHeat = (state: RootState) => state.map2D.pathHeat;
export const currentEditIndex = (state: RootState) => state.map2D.edits.currentIndex;
export const maxEditIndex = (state: RootState) => state.map2D.edits.maxIndex;
export const editBookmarks = (state: RootState) => state.map2D.edits.bookmarks;

export default tileMapSlice.reducer;