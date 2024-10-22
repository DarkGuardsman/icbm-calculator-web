import {DebugDotData, DebugLineData} from "../../graph/GraphRender";

export interface TNTBlastConfig {
    rayEnergy?: number;
    normalize?: boolean;
    stepEnergyCost?: number;
    stepSize?: number
}

export default function tntBlast(cx: number, cz: number,
                                 tiles: number[][],
                                 setTile: (x: number, y: number, tileId: number) => void,
                                 addDot: (dot: DebugDotData) => void,
                                 addLine: (line: DebugLineData) => void,
                                 addHeatMapHit: (x: number, y: number, hits: number) => void,
                                 config?: TNTBlastConfig
) {
    const normalize = config?.normalize ? config?.normalize : true;
    const rayStartEnergy = config?.rayEnergy ? config.rayEnergy : 6;
    const stepEnergyCost = config?.stepEnergyCost ? config.stepEnergyCost : 0.75;
    const stepSize = config?.stepSize ? config.stepSize : 0.3;

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

                for (let step = stepSize; radialEnergy > 0.0; radialEnergy -= step * stepEnergyCost) {

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