import {isDefined, valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {getExplosiveResistance, TILE_AIR, TILE_VOID, TileData} from "../../common/Tiles";
import {initEdits, SimEntryMap2D, TileMap2D} from "../../api/Map2D";
import {incrementSimEdit} from "../../tools/map/MapToolPage";
import {addSimEntry, getTile} from "../TileFuncs";
import tileMap from "../../data/map/tileMap";


export function largeBlast(tileMapGrid: TileMap2D,
                           applyEdits: (edits: SimEntryMap2D) => void,
                           args: TestArgValues
) {

    const centerX = valueOr<number>(args['x'] as number, 10);
    const centerZ = valueOr<number>(args['y'] as number, 10);
    const size = valueOr<number>(args['size'] as number, 10); //nuke is 50
    const energy = valueOr<number>(args['energy'] as number, 80); //nuke is 80

    //TODO add to customizations
    const stepSize = 0.5;
    const stepCost = 0.3 * 0.75 * 5; //TODO figure out magic numbers, its like this in the mod as well
    const lineDensityScale = 2;

    ///========================================================
    // Last updated: November 3rd, 2024 using 1.12.2-6.4.1 code githash: d9848cf98805d7ffe945d08ebef6718d0f1a08d0
    // This isn't a perfect replication as we can't 1:1 the code from 3D to 2D

    const sourceId = `BlastLarge-${Date.now()}`;
    let editIndex = 0;
    const edits: SimEntryMap2D = initEdits();

    const steps = Math.ceil(Math.PI / Math.atan(1.0 / size));
    for (let yawSlices = 0; yawSlices < lineDensityScale * steps; yawSlices++) {

        const yaw = (Math.PI / steps) * yawSlices;
        const pitch = 0; //(Math.PI / steps) * theta_n; // Its always zero since we are 2D

        const dx = Math.cos(pitch) * Math.cos(yaw) * stepSize;
        const dz = Math.cos(pitch) * Math.sin(yaw) * stepSize;

        let x = centerX;
        let z = centerZ;

        let distance = 0;

        let prevTileX: number = Number.MAX_SAFE_INTEGER;
        let prevTileZ: number = Number.MAX_SAFE_INTEGER;

        // Debug
        let stepIndexThisRay = 0;

        // Randomize power per ray
        let powerForRay = energy - (energy * Math.random() / 2);

        while ((dx * dx + dz * dz) > 0 && distance <= size && powerForRay > 0) {
            const nx = x - centerX;
            const nz = z - centerZ;
            distance = Math.sqrt(nx * nx + nz * nz);

            // This would normally be a BlockPos
            const tileX = Math.floor(x);
            const tileZ = Math.floor(z);

            //Consume power per loop
            powerForRay -= stepCost;

            let tile: TileData = TILE_VOID;
            let cost: number = 0;
            let willBreak = false;

            // Alg tries to run 1 edit per block per ray.
            if (prevTileX !== tileX || prevTileZ !== tileZ) {
                tile = getTile(x, z, tileMapGrid);
                cost = getExplosiveResistance(tile);
                willBreak = tile !== TILE_AIR && tile.hardness >= 0 && powerForRay - cost >= 0;
            }

            addSimEntry(edits, {
                x: tileX,
                y: tileZ,
                index: incrementSimEdit(),
                edit: (tile === TILE_VOID || !willBreak) ? undefined : {
                    newTile: TILE_AIR.index,
                    oldTile: tile.index
                },
                meta: {
                    mapAccessCount: prevTileX !== tileX || prevTileZ !== tileZ ? 1 : 0,
                    source: {
                        key: sourceId,
                        phase: `ray-${stepIndexThisRay++}`,
                        index: editIndex++
                    },
                    path: {
                        start: {
                            x,
                            y: z
                        },
                        end: {
                            x: x + dx,
                            y: z + dz
                        },
                        meta: {
                            energyLeft: powerForRay - cost,
                            energyCost: cost
                        }
                    }
                }
            });

            powerForRay -= cost;

            // Track previous tile
            prevTileX = tileX;
            prevTileZ = tileZ;

            //Move forward
            x += dx;
            z += dz;
        }


    }

    //Done
    applyEdits(edits);
}

export const NUKE_SIM_ENTRY: TestTypeEntry = {
    id: "icbmclassic:blast.nuclear@1.12.2-6.4.1",
    description: "Nuclear configuration using 'Blast Large' algorithm run on a separate thread from the game world",
    expandedInfo: "Like Minecraft TNT, ICBM's 'Blast Large' algorithm works via depth first incremental step raytracer." +
        "Unlike Minecraft's fixed values, ICBM uses yaw and pitch radian slices. Scaling " +
        "with size to ensure a more accurate results. While also deduplicating repeat block checks to " +
        "reduce impact on the game world. Other aspects are still similar such as a constant energy per step and scaled energy " +
        "cost per block. Though over all this algorithm runs faster and is more accurate at larger sizes. Yet much like " +
        "Minecraft's version it hasn't aged well and is considered a 'legacy' algorithm.",
    // TODO provide display info on predicted raytraces based on inputs
    args: {
        tabs: [
            {
                label: "Basic",
                sections: [
                    {
                        label: "Position",
                        args: ['x', 'y']
                    },
                    {
                        label: "Scale",
                        args: ['size', 'energy']
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
                key: "size",
                label: "Size",
                type: "float",
                default: 50
            },
            {
                key: "energy",
                label: "Energy",
                type: "float",
                default: 80
            }
        ]
    },
    runner: (_: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => largeBlast(tileMapGrid, applyEdits, args)
}