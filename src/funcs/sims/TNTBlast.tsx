import {DebugDotData, DebugLineData} from "../../graph/GraphRender";
import {valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";

export interface TNTBlastConfig {
    size?: number;
    normalize?: boolean;
    randomRayEnergy?:boolean;
    stepEnergy?: number;
    stepSize?: number;
    raysX?: number;
    raysY?: number;
}

export function tntBlast(cx: number, cz: number,
                                 tiles: number[][],
                                 setTile: (x: number, y: number, tileId: number) => void,
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

    addDot({
        x: cx, y: cz,
        size: 0.1,
        color: 'blue'
    });

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
                if(randomRayEnergy) {
                    radialEnergy *= 0.7 + Math.random() * 0.6;
                }

                //Get starting point for ray
                let x = cx;
                //double y = this.location.y();
                let z = cz;

                //final Color lineColor = Utils.randomColor();  //TODO random color

                for (; radialEnergy > 0.0; radialEnergy -= stepEnergyScale) {

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
                    addHeatMapHit(Math.floor(x), Math.floor(z), 1);
                }
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
            default: 16
        },
        y: {
            label: "Y",
            type: "float",
            default: 16
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
            default: 6
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
        tntBlast(x, y, props.tiles, props.setTile, props.addDot, props.addLine, props.addHeatMapHit, {
            size,
            normalize,
            randomRayEnergy,
            stepSize,
            stepEnergy,
            raysX,
            raysY
        });
    }
}