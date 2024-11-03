import {valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {getExplosiveResistance, TILE_AIR} from "../../common/Tiles";
import {initEdits, SimEntryMap2D, TileMap2D} from "../../api/Map2D";
import {incrementSimEdit} from "../../tools/map/MapToolPage";
import {addSimEntry, getTile} from "../TileFuncs";

export interface TNTBlastConfig {
    size?: number;
    normalize?: boolean;
    randomRayEnergy?: boolean;
    stepEnergy?: number;
    stepSize?: number;
    minEnergyCost?: number;
    scaleEnergyCost?: number;
    raysX?: number;
    raysY?: number;
}

export function tntBlast(cx: number, cz: number,
                         tileMapGrid: TileMap2D,
                         applyEdits: (edits: SimEntryMap2D) => void,
                         config?: TNTBlastConfig
) {

    const normalize = valueOr<boolean>(config?.normalize, true);
    const randomRayEnergy = valueOr<boolean>(config?.randomRayEnergy, true);
    const size = valueOr<number>(config?.size, 6);
    const stepEnergy = valueOr<number>(config?.stepEnergy, 0.225);
    const stepSize = valueOr<number>(config?.stepSize, 0.3);
    const raysX = valueOr<number>(config?.raysX, 16);
    const raysY = valueOr<number>(config?.raysY, 16);
    const minEnergyCost = valueOr<number>(config?.minEnergyCost, 0.3);
    const scaleEnergyCost = valueOr<number>(config?.scaleEnergyCost, 0.3);


    const sourceId = `TNT-${Date.now()}`;
    let editIndex = 0;
    const edits: SimEntryMap2D = initEdits();

    // This code mimics mojang's 1.12.2 TNT blast and is not very optimized
    for (let xs = 0; xs < raysX; ++xs) {
        //for (int ys = 0; ys < this.raysPerAxis; ++ys)
        for (let zs = 0; zs < raysY; ++zs) {
            if (xs === 0 || xs === raysX - 1 || /*ys == 0 || ys == raysPerAxis - 1 ||*/ zs === 0 || zs === raysY - 1) {
                //Step calculation, between -1 to 1 creating edge slices of a cube
                let xStep = xs / (raysX - 1.0) * 2.0 - 1.0;
                //double yStep = ys / (raysPerAxis - 1.0F) * 2.0F - 1.0F;
                let zStep = zs / (raysY - 1.0) * 2.0 - 1.0;

                //Distance
                const magnitude = Math.sqrt(xStep * xStep + /*yStep * yStep +*/ zStep * zStep);

                //normalize, takes it from a box shape to a circle shape
                if (normalize) {
                    xStep /= magnitude;
                    //yStep /= diagonalDistance;
                    zStep /= magnitude;
                }

                //Get energy
                let radialEnergy = size;
                if (randomRayEnergy) {
                    radialEnergy *= 0.7 + Math.random() * 0.6;
                }

                //Get starting point for ray
                let x = cx;
                //double y = this.location.y();
                let z = cz;

                for (; radialEnergy > 0.0; radialEnergy -= stepEnergy) {

                    const tileX = Math.floor(x);
                    const tileY = Math.floor(z);

                    const tile = getTile(tileX, tileY, tileMapGrid);

                    const explosiveResistance = getExplosiveResistance(tile);

                    let cost = 0;

                    if (tile !== TILE_AIR) {
                        // min energy is likely to offset zero hardness blocks like tall grass
                        // scaleEnergyCost is likely the same value as stepSize. Both are 0.3~ in the code.
                        //              Given we step 0.3 we hit the same both per ray on average 3 times
                        cost = (explosiveResistance + minEnergyCost) * scaleEnergyCost;
                        if ((radialEnergy - cost) > 0) {
                            radialEnergy -= cost
                        }
                    }

                    addSimEntry(edits, {
                        x: tileX,
                        y: tileY,
                        index: incrementSimEdit(),
                        edit: tile === TILE_AIR ? undefined : {
                            newTile: TILE_AIR.index,
                            oldTile: tile.index
                        },
                        meta: {
                            mapAccessCount: 1,
                            source: {
                                key: sourceId,
                                phase: `ray-${xs}-${zs}`,
                                index: editIndex++
                            },
                            path: {
                                start: {
                                    x,
                                    y: z
                                },
                                end: {
                                    x: x + xStep * stepSize,
                                    y: z + zStep * stepSize
                                },
                                meta: {
                                    energyLeft: radialEnergy - cost,
                                    energyCost: cost
                                }
                            }
                        }
                    })

                    //Iterate location
                    x += xStep * stepSize;
                    //y += yStep * step;
                    z += zStep * stepSize;
                }
            }
        }
    }

    //Done
    applyEdits(edits);
}

export const TNT_SIM_ENTRY: TestTypeEntry = {
    id: "minecraft:tnt@1.12.2",
    description: "Vanilla TNT explosive blast",
    args: {
        tabs: [
            {
                label: "Vanilla",
                sections: [
                    {
                        label: "Position",
                        args: ['x', 'y']
                    },
                    {
                        label: "Scale",
                        args: ['size']
                    }
                ]
            },
            {
                label: "Ray Tracing",
                sections: [
                    {
                        label: "Sections",
                        args: ['raysX', 'raysY']
                    },
                    {
                        label: "Ray",
                        args: ['stepSize', 'normalize']
                    }
                ]
            },
            {
                label: "Energy",
                sections: [
                    {
                        label: "Ray Cost",
                        args: ["randomRayEnergy", "stepEnergy"]
                    },
                    {
                        label: "Block Cost",
                        args: ["minEnergyCost", "scaleEnergyCost"]
                    }
                ]
            }
        ],
        data: [
            {
                key: 'x',
                label: "X",
                type: "float",
                default: 7.5
            },
            {
                key: 'y',
                label: "Y",
                type: "float",
                default: 7.5
            },
            {
                key: 'raysX',
                label: "Rays X",
                type: "float",
                default: 16
            },

            {
                key: "raysY",
                label:
                    "Rays Y",
                type:
                    "float",
                default:
                    16
            }
            ,
            {
                key: "size",
                label:
                    "Size",
                type:
                    "float",
                default:
                    4
            },
            {
                key: "normalize",
                label: "Normalize",
                type:
                    "bool",
                default:
                    true
            },
            {
                key: "randomRayEnergy",
                label: "Random Ray Energy",
                type:
                    "bool",
                default:
                    true
            },
            {
                key: "stepSize",
                label: "Step Size",
                type:
                    "float",
                default:
                    0.3
            },
            {
                key: "stepEnergy",
                label: "Step Energy",
                type:
                    "float",
                default:
                    0.225
            },
            {
                key: "minEnergyCost",
                label: "Min Energy Cost",
                type:
                    "float",
                default:
                    0.3
            },
            {
                key: "scaleEnergyCost",
                label: "Scale Energy Cost",
                type:
                    "float",
                default:
                    0.3
            }
        ]
    },
    runner: (_: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => {
        const x = args['x'] as number;
        const y = args['y'] as number;
        const raysX = args['raysX'] as number;
        const raysY = args['raysY'] as number;
        const size = args['size'] as number;
        const stepSize = args['stepSize'] as number;
        const stepEnergy = args['stepEnergy'] as number;
        const normalize = args['normalize'] as boolean;
        const randomRayEnergy = args['randomRayEnergy'] as boolean;
        const minEnergyCost = args['minEnergyCost'] as number;
        const scaleEnergyCost = args['scaleEnergyCost'] as number;
        tntBlast(x, y, tileMapGrid, applyEdits, {
            size,
            normalize,
            randomRayEnergy,
            stepSize,
            stepEnergy,
            raysX,
            raysY,
            minEnergyCost,
            scaleEnergyCost
        });
    }
}