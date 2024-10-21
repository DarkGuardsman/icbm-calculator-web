export interface TileData {
    key: string;
    index: number;
    color: string;
}

// TODO load from JSON
//      move to react context
export const TILE_SET: TileData[] = [
    {
        key: 'minecraft:air',
        color: 'rgb(146,245,243)'
    },
    {
        key: 'minecraft:dirt',
        color: 'rgb(220,159,47)'
    },
    {
        key: 'minecraft:stone',
        color: 'rgb(168,172,172)'
    },
    {
        key: 'minecraft:grass',
        color: 'rgb(56,193,56)'
    }
]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((entry, index) => ({...entry, index}));
export const TILE_IDS: number[] = TILE_SET.map(tile => tile.index);

export const TILE_ID_TO_OBJ: {[key:number]:TileData} = {};
TILE_SET.forEach(entry => TILE_ID_TO_OBJ[entry.index] = entry);

export const TILE_KEY_TO_OBJ: {[key:string]:TileData} = {};
TILE_SET.forEach(entry => TILE_KEY_TO_OBJ[entry.key] = entry);

export const TILE_AIR = TILE_KEY_TO_OBJ['minecraft:air'];

