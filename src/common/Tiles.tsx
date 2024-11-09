import {TileData} from "../api/TileMap2D";

export interface Tile {
    /**
     * Unique key, this needs to be domain + resource. For Minecraft this will be the block's key Ex: 'minecraft:dirt'
     * For older versions of Minecraft concat subtypes used for unique block-state. Do not include block-state properties
     * that are not unique such as rotation.
     *
     * Example: Minecraft 1.12.2 stone 'minecraft:stone.0' or 'minecraft:stone.stone'
     * or even better 'minecraft:stone' then give each subtype it's unique display name
     *
     * */
    key: string;
    /** Auto generated unique index for map storage */
    index: number; //TODO we could remove this and use key instead. Map data is small enough?
    /** Simplified color of the tile */
    color: string;
    /** Resistance of the tile to breaking by explosives */
    resistance: number;
    /** Resistance of the tile to breaking by tools */
    hardness: number;
    /** Is the tile a fluid (gas or liquid) */
    isFluid: boolean;
    /** Is the tile impacted by gravity */
    isGravity: boolean;
    /** Init placement data. For Minecraft this will likely include BlockState and BlockEntity information */
    data?: TileData;
    /** Images to use for rendering, largest image possible for the component will be used. Smaller images
     * will be selected as component changes size or render scale is a better fit. */
    images?: {
        // By default, we want 8x8 assets that sorta look like the real thing but are distinct to avoid copyright issues
        //      Then we want need downscale to allow rendering to work are different scales. This can be automated.
        //      Long term we want to try to get the real assets but need to do this on a case by case for copyright reasons
        /** Size in pixels */
        size: number;
        /** Location of the asset */
        src: string; //TODO support remote assets, may require auth with Microsoft to get Mojang's assets properly
    }[]

    //TODO collision box
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
        color: 'rgb(146,245,243, 0.1)',
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
        color: 'rgb(38,84,184, 0.5)',
        isFluid: true,
        hardness: 100
    },
    {
        key: 'minecraft:lava',
        color: 'rgb(214,79,23, 0.8)',
        isFluid: true,
        hardness: 100
    },
    {
        key: 'machine:battery',
        color: 'rgb(80,78,76)',
        hardness: 10,
        images: [
            {
                size: 8,
                src: `${process.env.PUBLIC_URL}/assets/tiles/machine/battery_8px.png`
            }
        ],
        data: {
            energyPower: 1_000
        }
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

/** {@link Tile#index} to {@link Tile} */
export const TILE_ID_TO_OBJ: { [key: number]: Tile } = {};
TILE_SET.forEach(entry => TILE_ID_TO_OBJ[entry.index] = entry);

/** {@link Tile#key} to {@link Tile} */
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

