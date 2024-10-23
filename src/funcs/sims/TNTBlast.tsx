import {DebugDotData, DebugLineData} from "../../graph/GraphRender";
import {valueOr} from "../Helpers";
import {
    SimulationSelectorProps,
    TestArgValues,
    TestTypeEntry
} from "../../tools/selector/simulation/SimulationSelector";

export interface TNTBlastConfig {
    rayEnergy?: number;
    normalize?: boolean;
    stepEnergyScale?: number;
    stepSize?: number
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
    const rayStartEnergy = valueOr<number>(config?.rayEnergy, 6);
    const stepEnergyScale = valueOr<number>(config?.stepEnergyScale, 0.75);
    const stepSize = valueOr<number>(config?.stepSize, 0.3);

    addDot({
        x: cx, y: cz,
        size: 0.1,
        color: 'blue'
    });

    const raysPerAxis = 16;
    for (let xs = 0; xs < raysPerAxis; ++xs) {
        //for (int ys = 0; ys < this.raysPerAxis; ++ys)
        //final int ys = 0;
        for (let zs = 0; zs < raysPerAxis; ++zs) {
            if (xs === 0 || xs === raysPerAxis - 1 || /*ys == 0 || ys == raysPerAxis - 1 ||*/ zs === 0 || zs === raysPerAxis - 1) {
                //Step calculation, between -1 to 1 creating edge slices of a cube
                let xStep = xs / (raysPerAxis - 1.0) * 2.0 - 1.0;
                //double yStep = ys / (raysPerAxis - 1.0F) * 2.0F - 1.0F;
                let zStep = zs / (raysPerAxis - 1.0) * 2.0 - 1.0;

                //Distance
                const magnitude = Math.sqrt(xStep * xStep + /*yStep * yStep +*/ zStep * zStep);

                //normalize, takes it from a box shape to a circle shape
                if (normalize) {
                    xStep /= magnitude;
                    //yStep /= diagonalDistance;
                    zStep /= magnitude;
                }

                //Get energy
                let radialEnergy = rayStartEnergy; //* (0.7F + random.nextFloat() * 0.6F);

                //Get starting point for ray
                let x = cx;
                //double y = this.location.y();
                let z = cz;

                //final Color lineColor = Utils.randomColor();  //TODO random color

                for (let step = stepSize; radialEnergy > 0.0; radialEnergy -= step * stepEnergyScale) {

                    addDot({
                        x: x + xStep * step,
                        y: z + zStep * step,
                        size: 0.11,
                        color: 'blue' //TODO random color
                    });
                    addLine({
                        startX: x,
                        startY: z,
                        endX: x + xStep * step,
                        endY: z + zStep * step,
                        size: 0.05,
                        color: 'red' //TODO random color
                    });

                    //Iterate location
                    x += xStep * step;
                    //y += yStep * step;
                    z += zStep * step

                    // Track ray trace heat
                    addHeatMapHit(Math.floor(x), Math.floor(z), 1);
                }
            }
        }
    }
}

export const TNT_SIM_ENTRY: TestTypeEntry = {
    id: "minecraft:tnt",
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
        energy: {
            label: "Energy",
            type: "float",
            default: 6
        },
        normalize: {
            label: "Normalize",
            type: "bool",
            default: true
        },
        stepSize: {
            label: "Step Size",
            type: "float",
            default: 0.3
        },
        stepEnergyScale: {
            label: "Step Energy Scale",
            type: "float",
            default: 0.75
        }
    },
    runner: (props: SimulationSelectorProps, args: TestArgValues) => {
        const x = args['x'] as number;
        const y = args['y'] as number;
        const energy = args['energy'] as number;
        const stepSize = args['stepSize'] as number;
        const stepEnergyScale = args['stepEnergyScale'] as number;
        const normalize = args['normalize'] as boolean;
        tntBlast(x, y, props.tiles, props.setTile, props.addDot, props.addLine, props.addHeatMapHit, {
            rayEnergy: energy,
            normalize,
            stepSize,
            stepEnergyScale
        });
    }
}