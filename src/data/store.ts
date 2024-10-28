import {configureStore} from "@reduxjs/toolkit";
import tileMapReducer from "./map/tileMap";

export const store = configureStore({
    reducer: {
        map2D: tileMapReducer //TODO tbh could use same map for 3D and just have the graph render layer zero? or... have a layer selector
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;