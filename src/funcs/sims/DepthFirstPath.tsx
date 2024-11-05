import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {initEdits, SimEntryMap2D, TileMap2D} from "../../api/Map2D";
import {isDefined, valueOr} from "../Helpers";
import {addSimEntry, map2DContainsPos} from "../TileFuncs";
import {incrementSimEdit} from "../../tools/map/MapToolPage";
import Pos2D from "../../api/Pos2D";
import {SIDES_2D} from "../../common/Consts";
import {addPos2D, pos2DEquals} from "../../common/Pos2DHelpers";


function doPath(tileMapGrid: TileMap2D,
                applyEdits: (edits: SimEntryMap2D) => void,
                args: TestArgValues
) {

    const centerX = valueOr<number>(args['x'] as number, 10);
    const centerY = valueOr<number>(args['y'] as number, 10);
    const maxDepth = valueOr<number>(args['maxDepth'] as number, 10);

    const sourceId = `expandDepthFirst-${Date.now()}`
    let editIndex = 0;

    const edits: SimEntryMap2D = initEdits();

    const stack: Pos2D[] = [{x: centerX, y: centerY}];

    while (stack.length > 0) {
        const nextPos = stack.pop();

        console.log(nextPos);

        if (!isDefined(nextPos)) {
            continue;
        }

        const nextTiles = SIDES_2D
            .map(side => addPos2D(nextPos, side))
            .filter(sidePos => !pos2DEquals(nextPos, sidePos));

        console.log(nextTiles);

        // old school loop because tslint hates access vars inside a forEach
        for(let i = 0; i < nextTiles.length; i++) {
            const nextTile = nextTiles[i];

            const deltaX = centerX - nextPos.x;
            const deltaY = centerY - nextPos.y;
            const distance = Math.abs(deltaX) + Math.abs(deltaY); // TODO add selector to change which distance alg is used

            const atLimit = distance >= maxDepth;
            const hasPathed = map2DContainsPos(edits, nextTile.x, nextTile.y);

            if(!hasPathed && !atLimit) {
                stack.push(nextTile);
            }

            addSimEntry(edits, {
                x: nextTile.x,
                y: nextTile.y,
                index: incrementSimEdit(),
                edit: undefined,
                meta: {
                    mapAccessCount: 0,
                    source: {
                        key: sourceId,
                        phase: 'pathing',
                        index: editIndex++
                    },
                    path: {
                        start: {
                            x: nextPos.x + 0.5,
                            y: nextPos.y + 0.5
                        },
                        end: {
                            x: nextTile.x + 0.5,
                            y: nextTile.y + 0.5
                        },
                        meta: {
                            endType: atLimit ? 'done' : (hasPathed ? 'collision' : 'continue')
                        }
                    }
                }
            })
        }
    }

    applyEdits(edits);
}

export const DEPTH_FIRST_EXPAND: TestTypeEntry = {
    runner: (_: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => doPath(tileMapGrid, applyEdits, args),
    id: "random:expand.depth_first",
    description: "Expands pathing from tile to tile moving deep before broad",
    args: {
        tabs: [
            {
                label: "Basic",
                sections: [
                    {
                        label: "Start",
                        args: ['x', 'y']
                    },
                    {
                        label: "Checks",
                        args: ['maxDepth']
                    }
                ]
            }
        ],
        data: [
            {
                key: 'x',
                label: "X",
                type: "int",
                default: 6
            },
            {
                key: 'y',
                label: "Y",
                type: "int",
                default: 6
            },
            {
                key: "maxDepth",
                label: "Max Depth",
                type: "float",
                default: 10
            }
        ]
    }
}