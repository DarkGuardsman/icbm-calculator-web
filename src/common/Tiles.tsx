export interface Tile {
    key: string;
    index: number;
    color: string;
    resistance: number;
    hardness: number;
    isFluid: boolean;
    isGravity: boolean;
}


// TODO load from JSON
//      move to react context
export const TILE_SET: Tile[] = [
    {
        key: 'void',
        color: 'rgba(0,0,0,0.21)',
        resistance: 0,
        hardness: 0
    },
    {
        key: 'minecraft:air',
        color: 'rgb(146,245,243)',
        resistance: 0,
        hardness: 0
    },
    {
        key: 'minecraft:stone',
        color: 'rgb(168,172,172)',
        resistance: 10,
        hardness: 1.5
    },
    {
        key: 'minecraft:grass',
        color: 'rgb(30,96,30)',
        hardness: 0.6
    },
    {
        key: 'minecraft:dirt',
        color: 'rgb(193,136,25)',
        hardness: 0.5
    },
    {
        key: 'minecraft:sand',
        color: 'rgb(213,211,68)',
        hardness: 0.5,
        isGravity: true
    },
    {
        key: 'minecraft:cobble',
        color: 'rgb(80,78,76)',
        resistance: 10,
        hardness: 2
    },
    {
        key: 'minecraft:plank',
        color: 'rgb(151,131,23)',
        resistance: 5,
        hardness: 2
    },
    {
        key: 'minecraft:water',
        color: 'rgb(38,84,184)',
        isFluid: true,
        hardness: 100
    },
    {
        key: 'minecraft:lava',
        color: 'rgb(214,79,23)',
        isFluid: true,
        hardness: 100
    }
]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((entry, index) => (
        {
            ...entry,
            resistance: entry?.resistance ? entry.resistance * 3 : entry.hardness * 5,
            hardness: entry.hardness,
            isFluid: entry.isFluid ?? false,
            isGravity: entry.isGravity ?? false,
            index
        }
    ));
export const TILE_IDS: number[] = TILE_SET.map(tile => tile.index);

export const TILE_ID_TO_OBJ: { [key: number]: Tile } = {};
TILE_SET.forEach(entry => TILE_ID_TO_OBJ[entry.index] = entry);

export const TILE_KEY_TO_OBJ: { [key: string]: Tile } = {};
TILE_SET.forEach(entry => TILE_KEY_TO_OBJ[entry.key] = entry);

export const TILE_AIR = TILE_KEY_TO_OBJ['minecraft:air'];
export const TILE_VOID = TILE_KEY_TO_OBJ['void'];

export function getExplosiveResistance(tile: Tile): number {
    // Will not understand why mojang sets a value for resistance just to divide it by 5
    return tile.resistance / 5;
}

export function isAir(tile: Tile | undefined) {
    return tile?.index === TILE_AIR.index
}

