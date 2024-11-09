import Map2D from "./Map2D";

export interface TileMap2D extends Map2D<TileMapCell2D> {
}

export interface TileMapCell2D {
    /** Tile id */
    tile?: number;
    /** Data for the given tile */
    data?: TileData
}

export interface TileData {
    /** Between 0-3 matching {@link SIDES_2D} */
    facing?: number;
    /** Electrical power energy */
    energyPower?: number;
    /** Thermal energy */
    energyHeat?: number;

    // Make sure to update merge for each new file added
}