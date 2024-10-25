import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {isDefined, valueOr} from "../../funcs/Helpers";
import {TILE_AIR, TILE_ID_TO_OBJ} from "../../common/Tiles";

export interface TileMapState {
   tiles: TileMapGrid;
   sizeX: number;
   sizeY: number;
}

export interface  TileMapGrid {
    [y:number]: {[x:number]: number}
}

const initialState: TileMapState = {
    tiles: {},
    sizeX: 0,
    sizeY: 0
}

export interface TileMapGridEdit {
    x: number;
    y: number;
    id: number,
    /** Information about why/how the edit was made */
    meta?: {
        [key: string]: any
    }
}

export const tileMapSlice = createSlice({
    name: 'tiles',
    initialState,
    reducers: {
        applyMapEdit: (state: TileMapState, action: PayloadAction<TileMapGridEdit>) => applyEdit(state, action.payload),
        applyMapEdits: (state: TileMapState, action: PayloadAction<TileMapGridEdit[]>) => {
            // TODO optimize to reduce obj waste
            action.payload.forEach(edit => {
                applyEdit(state, edit);
            })
        },
        clearTiles: (state) => {
            state.tiles = {};
            state.sizeX = 0;
            state.sizeY = 0;
        }
    }
});

function applyEdit(state: TileMapState, edit: TileMapGridEdit) {
    const {x, y, id} = edit;
    if(!isDefined(state.tiles[y])) {
        state.tiles[y] = {
            [x]: id
        };
    }
    else {
        state.tiles[y] = {
            ...state.tiles[y],
            [x]: id
        };
    }

    if(x > state.sizeX) {
        state.sizeX = x;
    }
    if(y > state.sizeY) {
        state.sizeY = y;
    }
}

export function getTileId(x: number, y: number, grid: TileMapGrid): number {
    if(isDefined(grid[y])) {
        return valueOr(grid[y][x], TILE_AIR.index);
    }
    return TILE_AIR.index;
}

export function getTile(x: number, y: number, grid: TileMapGrid) {
    return TILE_ID_TO_OBJ[getTileId(x, y, grid)];
}

export const {applyMapEdit, applyMapEdits, clearTiles} = tileMapSlice.actions;

export const selectTiles = (state: RootState) => state.tiles.tiles;

export default tileMapSlice.reducer;