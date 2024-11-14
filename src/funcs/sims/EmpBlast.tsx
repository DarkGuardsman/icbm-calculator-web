import {isDefined, valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {initEdits, SimEntryMap2D} from "../../api/Map2D";
import {incrementSimEdit} from "../../tools/map/MapToolPage";
import {addSimEntry, cloneTileData, getTileGridData} from "../TileFuncs";
import {TileData, TileMap2D, TileMapCell2D} from "../../api/TileMap2D";
import {Tile, TILE_ID_TO_OBJ, TILE_WIRE, TILE_WIRE_DAMAGED} from "../../common/Tiles";
import {MapSimEdit2D} from "../../api/MapSimEntry2D";

export interface TileReplacement {
    input: {
        tile: Tile,
        data?: TileData
    };
    output: {
        tile: Tile,
        data?: TileData
    };
}


export function empOld(tileMapGrid: TileMap2D,
                       applyEdits: (edits: SimEntryMap2D) => void,
                       args: TestArgValues
) {

    const centerX = valueOr<number>(args['x'] as number, 10);
    const centerZ = valueOr<number>(args['y'] as number, 10);
    const size = valueOr<number>(args['size'] as number, 55);
    const replacements: TileReplacement[] = valueOr(args['tiles'] as TileReplacement[], []);


    ///========================================================
    // Last updated: November 3rd, 2024 using 1.12.2-6.4.1 code githash: d9848cf98805d7ffe945d08ebef6718d0f1a08d0
    // This isn't a perfect replication as we can't 1:1 the code from 3D to 2D

    const sourceId = `Antimatter-${Date.now()}`;
    let editIndex = 0;
    const edits: SimEntryMap2D = initEdits();


    for (let dx = -size; dx <= size; dx++) {

        let lastZ = Math.floor(centerZ) -size;
        for (let dz = -size; dz <= size; dz++) {
            const tileX = Math.floor(centerX) + dx;
            const tileZ = Math.floor(centerZ) + dz;

            const gridData = getTileGridData<TileMapCell2D>(tileX, tileZ, tileMapGrid);
            const willEmpTile = shouldEditPos(gridData);

            const tileData = gridData?.tile ? TILE_ID_TO_OBJ[gridData?.tile]: undefined;
            const replacement = replacements.find(r => r.input.tile === tileData);

            let edit: MapSimEdit2D | undefined = undefined;

            if(replacement) {
                edit = {
                    action: 'override',
                    newTile: {
                        tile: replacement.output.tile.index,
                        data: !isDefined(replacement.output.data) ? undefined : {
                           ...replacement.output.data
                        }
                    },
                    oldTile: cloneTileData(gridData)
                }
            }
            else if(willEmpTile) {
                edit = {
                    action: 'override',
                    newTile: {
                        data: {
                            energyPower: 0
                        }
                    },
                    oldTile: cloneTileData(gridData)
                }
            }


            // Collect pathing as this is step 0
            addSimEntry(edits, {
                x: tileX,
                y: tileZ,
                index: incrementSimEdit(),
                edit: edit,
                meta: {
                    mapAccessCount: 1,
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
                            nodeType: !willEmpTile ? 'ignore' : 'action'
                        }
                    }
                }
            });

            lastZ = tileZ;
        }
    }

    //Done
    applyEdits(edits);
}

function shouldEditPos(gridData: TileMapCell2D | undefined) {
    return isDefined(gridData?.data?.energyPower); //TODO change to a machine check and include tile replacement mechanic
}

export const EMP_LOGIC_V6_4_1: TestTypeEntry = {
    runner: (_: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => empOld(tileMapGrid, applyEdits, args),
    id: "icbmclassic:blast.emp@1.12.2-6.4.1",
    description: "EMP runs a simple xyz replacement block algorithm with no validation for line of sight or collisions. Its a simple alg but very limited in terms of mechanics/interactions.",
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
                label: "Advanced",
                sections: [
                    {
                        label: "Replacements",
                        args: ['tiles']
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
                label: "Size (x2 - Box)",
                type: "float",
                default: 50
            },
            {
                key: 'tiles',
                label: "Replacements",
                type: 'tileReplacements',
                default: [{
                    input: {
                        tile: TILE_WIRE
                    },
                    output: {
                        tile: TILE_WIRE_DAMAGED
                    }
                }]
            }
        ]
    }
}