import {isDefined, sortNum, valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {TILE_ID_TO_OBJ, TILE_VOID} from "../../common/Tiles";
import {initEdits, SimEntryMap2D} from "../../api/Map2D";
import {incrementSimEdit} from "../../tools/map/MapToolPage";
import {addSimEntry, cloneTileData, getTileGridData} from "../TileFuncs";
import MapSimEntry2D from "../../api/MapSimEntry2D";
import {TileMap2D} from "../../api/TileMap2D";


export function antimatterBlast(tileMapGrid: TileMap2D,
                                applyEdits: (edits: SimEntryMap2D) => void,
                                args: TestArgValues
) {

    const centerX = valueOr<number>(args['x'] as number, 10);
    const centerZ = valueOr<number>(args['y'] as number, 10);
    const size = valueOr<number>(args['size'] as number, 55);
    const feathering = valueOr<number>(args['feathering'] as number, 0.05);


    ///========================================================
    // Last updated: November 3rd, 2024 using 1.12.2-6.4.1 code githash: d9848cf98805d7ffe945d08ebef6718d0f1a08d0
    // This isn't a perfect replication as we can't 1:1 the code from 3D to 2D

    const sourceId = `Antimatter-${Date.now()}`;
    let editIndex = 0;
    const edits: SimEntryMap2D = initEdits();

    const collectedBlocks: MapSimEntry2D[] = [];


    for (let dx = -size; dx <= size; dx++) {

        let lastZ = Math.floor(centerZ) -size;
        for (let dz = -size; dz <= size; dz++) {
            const tileX = Math.floor(centerX) + dx;
            const tileZ = Math.floor(centerZ) + dz;

            const tile = getTileGridData(tileX, tileZ, tileMapGrid);

            const  radiusSQ = size * size;
            const distanceSQ = dx * dx + dz * dz;

            // Collect pathing as this is step 0
            addSimEntry(edits, {
                x: tileX,
                y: tileZ,
                index: incrementSimEdit(),
                edit: undefined,
                meta: {
                    mapAccessCount: 0,
                    source: {
                        key: sourceId,
                        phase: `pathing${dx === 0 ? "-" : (dx < 0 ? "-n" : "-p")}${Math.abs(dx)}`,
                        index: editIndex++
                    },
                    path: {
                        start: {
                            x: Math.floor(centerX) + dx + 0.5,
                            y: lastZ + 0.5
                        },
                        end: {
                            x: tileX + 0.5,
                            y: tileZ + 0.5
                        },
                        meta: {
                            endType: 'continue',
                            nodeType: distanceSQ > radiusSQ || !shouldEditPos(dx, dz, size, feathering) ? 'ignore' : 'action'
                        }
                    }
                }
            });



            // Collect blocks we plan to edit
            if (distanceSQ <= radiusSQ && shouldEditPos(dx, dz, size, feathering)) {
                collectedBlocks.push({
                    x: tileX,
                    y: tileZ,
                    index: -1,
                    edit: {
                        action: 'override',
                        newTile: {
                            tile: TILE_VOID.index
                        },
                        oldTile: cloneTileData(tile)
                    },
                    meta: {
                        mapAccessCount: 1,
                        source: {
                            key: sourceId,
                            phase: '',
                            index: -1
                        }
                    }
                });
            }

            lastZ = tileZ;
        }
    }

    // Sort by distance
    collectedBlocks.sort((a, b) => {

        const aDeltaX = Math.abs(centerX - a.x);
        const aDeltaY = Math.abs(centerZ - a.y);

        const bDeltaX = Math.abs(centerX - b.x);
        const bDeltaY = Math.abs(centerZ - b.y);

        return sortNum(aDeltaX * aDeltaX + aDeltaY * aDeltaY, bDeltaX * bDeltaX + bDeltaY * bDeltaY)
    });

    // Remove fluids first
    collectedBlocks.filter(b => b.edit?.oldTile !== undefined && isFluid(b.edit.oldTile?.tile)).forEach(b => {
        b.index = incrementSimEdit();
        b.meta.source.phase = 'fluids';
        b.meta.source.index = editIndex++;
        addSimEntry(edits, b);
    });

    // Remove others last
    collectedBlocks.filter(b => b.edit?.oldTile !== undefined && !isFluid(b.edit.oldTile?.tile)).forEach(b => {
        b.index = incrementSimEdit();
        b.meta.source.phase = 'solid';
        b.meta.source.index = editIndex++;
        addSimEntry(edits, b);
    });

    //Done
    applyEdits(edits);
}

function isFluid(id: number | undefined) {
    return !isDefined(id) || TILE_ID_TO_OBJ[id].isFluid || TILE_ID_TO_OBJ[id].isGravity;
}

function shouldEditPos(x: number, z: number, size: number, feathering: number) {
    const distSQ = x * x + z * z;
    const blastSQ = size * size;

    const featherEdge = Math.floor(blastSQ * feathering);
    const delta = Math.floor(blastSQ - distSQ);

    if (delta < featherEdge) {
        const p2 = 1 - (delta / featherEdge);
        return Math.random() > p2;
    }
    return true;
}

export const ANTIMATTER_ENTRY: TestTypeEntry = {
    runner: (_: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => antimatterBlast(tileMapGrid, applyEdits, args),
    id: "icbmclassic:blast.antimatter@1.12.2-6.4.1",
    description: "Antimatter runs a simple xyz replacement block algorithm with sorting & feathering on edge to give a blast visual",
    // TODO provide display info on predicted raytraces based on inputs
    args: {
        tabs: [
            {
                label: "ICBM",
                sections: [
                    {
                        label: "Position",
                        args: ['x', 'y']
                    },
                    {
                        label: "Configuration",
                        args: ['size']
                    }
                ]
            },
            {
                label: "Extras",
                sections: [
                    {
                        label: "Pattern",
                        args: ['feathering']
                    }
                ]
            }
        ],
        data: [
            {
                key: 'x',
                label: "X",
                type: "int",
                default: 56
            },
            {
                key: 'y',
                label: "Y",
                type: "int",
                default: 56
            },
            {
                key: "size",
                label: "Size (Radius)",
                type: "float",
                default: 55
            },
            {
                key: "feathering",
                label: "Feathering",
                type: "float",
                default: 0.05
            }
        ]
    }
}