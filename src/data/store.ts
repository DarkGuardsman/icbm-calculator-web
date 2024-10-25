import {configureStore} from "@reduxjs/toolkit";
import tileMapReducer from "./map/tileMap";

export const store = configureStore({
    reducer: {
        tiles: tileMapReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;