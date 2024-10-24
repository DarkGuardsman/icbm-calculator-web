import {DebugDotData, DebugLineData} from "../../graph/GraphRender";
import {isDefined, valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";
import {getExplosiveResistance, TILE_AIR, TILE_ID_TO_OBJ, TILE_SET} from "../../common/Tiles";

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
                         tiles: number[][],
                         setTiles: (tiles: number[][]) => void,
                         addDot: (dot: DebugDotData) => void,
                         addLine: (line: DebugLineData) => void,
                         addHeatMapHit: (x: number, y: number, hits: number) => void,
                         config?: TNTBlastConfig
) {

    const normalize = valueOr<boolean>(config?.normalize, true);
    const randomRayEnergy = valueOr<boolean>(config?.randomRayEnergy, true);
    const rayStartEnergy = valueOr<number>(config?.size, 6);
    const stepEnergyScale = valueOr<number>(config?.stepEnergy, 0.225);
    const stepSize = valueOr<number>(config?.stepSize, 0.3);
    const raysX = valueOr<number>(config?.raysX, 16);
    const raysY = valueOr<number>(config?.raysY, 16);
    const minEnergyCost = valueOr<number>(config?.minEnergyCost, 0.3);
    const scaleEnergyCost = valueOr<number>(config?.scaleEnergyCost, 0.3);

    addDot({
        x: cx, y: cz,
        size: 0.1,
        color: 'blue'
    });

    const edits: { x: number, y: number, tileId: number, energy: number, cost: number }[] = [];

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
                let radialEnergy = rayStartEnergy;
                if (randomRayEnergy) {
                    radialEnergy *= 0.7 + Math.random() * 0.6;
                }

                //Get starting point for ray
                let x = cx;
                //double y = this.location.y();
                let z = cz;

                //final Color lineColor = Utils.randomColor();  //TODO random color

                for (; radialEnergy > 0.0; radialEnergy -= stepEnergyScale) {

                    const tileX = Math.floor(x);
                    const tileY = Math.floor(z);

                    if (isDefined(tiles[tileY]) && (tileX !== Math.floor(cx) || tileY !== Math.floor(cz))) { //TODO remove center block
                        const tileId: number = tiles[tileY][tileX];
                        if (isDefined(tiles[tileId])) {
                            const tile = TILE_ID_TO_OBJ[tileId];

                            if (isDefined(tile)) {
                                if (tile !== TILE_AIR) {
                                    const explosiveResistance = getExplosiveResistance(tile);


                                    const cost = (explosiveResistance + minEnergyCost) * scaleEnergyCost;
                                    if ((radialEnergy - cost) > 0) {
                                        edits.push({
                                            x: tileX,
                                            y: tileY,
                                            tileId,
                                            energy: radialEnergy - cost,
                                            cost
                                        })
                                        radialEnergy -= cost
                                    }
                                    // Out of energy
                                    else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }


                    // Debug visuals
                    addDot({
                        x: x + xStep * stepSize,
                        y: z + zStep * stepSize,
                        size: 0.11,
                        color: 'blue' //TODO random color
                    });
                    addLine({
                        startX: x,
                        startY: z,
                        endX: x + xStep * stepSize,
                        endY: z + zStep * stepSize,
                        size: 0.05,
                        color: 'red' //TODO random color
                    });

                    //Iterate location
                    x += xStep * stepSize;
                    //y += yStep * step;
                    z += zStep * stepSize;

                    // Track ray trace heat
                    addHeatMapHit(tileX, tileY, 1);
                }

                const tileCopy = tiles.map(row => [...row]);
                edits.forEach((edit) => {
                    tileCopy[edit.y][edit.x] = TILE_AIR.index;
                })
                setTiles(tileCopy)
            }
        }
    }
}

export const TNT_SIM_ENTRY: TestTypeEntry = {
    id: "minecraft:tnt@1.12.2",
    description: "Vanilla TNT explosive blast",
    args: {
        x: {
            label: "X",
            type: "float",
            default: 4.5
        },
        y: {
            label: "Y",
            type: "float",
            default: 4.5
        },
        raysX: {
            label: "Rays X",
            type: "float",
            default: 16
        },
        raysY: {
            label: "Rays Y",
            type: "float",
            default: 16
        },
        size: {
            label: "Size",
            type: "float",
            default: 4
        },
        normalize: {
            label: "Normalize",
            type: "bool",
            default: true
        },
        randomRayEnergy: {
            label: "Random Ray Energy",
            type: "bool",
            default: true
        },
        stepSize: {
            label: "Step Size",
            type: "float",
            default: 0.3
        },
        stepEnergy: {
            label: "Step Energy",
            type: "float",
            default: 0.225
        },
        minEnergyCost: {
            label: "Min Energy Cost",
            type: "float",
            default: 0.3
        },
        scaleEnergyCost: {
            label: "Scale Energy Cost",
            type: "float",
            default: 0.3
        }
    },
    runner: (props: SimulationSelectorProps, args: TestArgValues) => {
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
        tntBlast(x, y, props.tiles, props.setTiles, props.addDot, props.addLine, props.addHeatMapHit, {
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