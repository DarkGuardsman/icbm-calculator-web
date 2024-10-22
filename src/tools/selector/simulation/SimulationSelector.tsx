import styles from "./SimulationSelector.module.css";
import Select from "react-select";
import {useState} from "react";
import {TILE_AIR, TILE_SET} from "../../../common/Tiles";
import {DebugDotData, DebugLineData} from "../../../graph/GraphRender";

interface TestTypeEntry {
    id: string;
    description: string;
}

const testOptions: TestTypeEntry[] = [
    {
        id: "minecraft:tnt",
        description: "Vanilla TNT explosive blast"
    },
    {
        id: "random:fill",
        description: "Fills entire map, mostly exists for testing the runtime"
    }
]

export interface SimulationSelectorProps {
    tiles: number[][];
    setTile: (x: number, y: number, tileId: number) => void;
    addDot: (dot: DebugDotData) => void;
    addLine: (line: DebugLineData) => void;
    onRun: () => void;
    hasRun: boolean;
}

export default function SimulationSelector({tiles, setTile, addDot, addLine, onRun, hasRun}: SimulationSelectorProps) {
    const [testToRun, setTestToRun] = useState<TestTypeEntry | null | undefined>(testOptions[0]);

    const runSimulation = () => {
        if (testToRun?.id === undefined) {
            return;
        }

        onRun();
        if(testToRun.id === "minecraft:tnt") {
            tntBlast(16, 16, 10, false, tiles, setTile, addDot, addLine);
        }
        else if (testToRun.id === "random:fill") {
            for (let y = 0; y < tiles.length; y++) {
                for (let x = 0; x < tiles[y].length; x++) {
                    const tileToUse = TILE_SET
                        .filter(t => !t.key.includes("air"))
                        .find((t, i) => {
                            const index = Math.floor(Math.random() * (TILE_SET.length - 1));
                            return i === index;
                        });
                    setTile(x, y, tileToUse?.index === undefined ? TILE_AIR.index : tileToUse.index);
                }
            }
        }
    };

    return (
        <div className={styles.testHeader}>
            <div className={styles.testSelector}>
                <Select
                    options={testOptions}
                    value={testToRun}
                    getOptionValue={(tile: TestTypeEntry) => tile.id}
                    getOptionLabel={(tile: TestTypeEntry) => tile.id}
                    onChange={(value) => setTestToRun(value)}
                />
            </div>
            <div className={styles.testDescription}>Description: {testToRun?.description}</div>
            <div className={styles.testRunButton}>
                <button onClick={runSimulation} disabled={hasRun || testToRun?.id === undefined}>RUN</button>
            </div>
        </div>
    )
}

function tntBlast(cx:number, cz:number,
                  size: number,
                  normalize: boolean,
                  tiles: number[][],
                  setTile: (x: number, y: number, tileId: number) => void,
                  addDot: (dot: DebugDotData) => void,
                  addLine: (line: DebugLineData) => void
) {
    addDot({
        x: cx, y: cz,
        size: 0.1,
        color: 'blue'
    });

    const raysPerAxis = 16;
    for (let xs = 0; xs < raysPerAxis; ++xs)
    {
        //for (int ys = 0; ys < this.raysPerAxis; ++ys)
        //final int ys = 0;
        for (let zs = 0; zs < raysPerAxis; ++zs)
        {
            if (xs === 0 || xs === raysPerAxis - 1 || /*ys == 0 || ys == raysPerAxis - 1 ||*/ zs === 0 || zs === raysPerAxis - 1)
            {
                //Step calculation, between -1 to 1 creating edge slices of a cube
                let xStep = xs / (raysPerAxis - 1.0) * 2.0 - 1.0;
                //double yStep = ys / (raysPerAxis - 1.0F) * 2.0F - 1.0F;
                let zStep = zs / (raysPerAxis - 1.0) * 2.0 - 1.0;

                //Distance
                const magnitude = Math.sqrt(xStep * xStep + /*yStep * yStep +*/ zStep * zStep);

                //normalize, takes it from a box shape to a circle shape
                if (normalize)
                {
                    xStep /= magnitude;
                    //yStep /= diagonalDistance;
                    zStep /= magnitude;
                }

                //Get energy
                let radialEnergy = size; //* (0.7F + random.nextFloat() * 0.6F);

                //Get starting point for ray
                let x = cx;
                //double y = this.location.y();
                let z = cz;

                //final Color lineColor = Utils.randomColor();

                for (let step = 0.3; radialEnergy > 0.0; radialEnergy -= step * 0.75)
                {
                    addDot({
                        x,
                        y: z,
                        size: 0.1,
                        color: 'blue'
                    });
                    addLine({
                        startX: x,
                        startY: z,
                        endX: x + xStep * step,
                        endY: z + zStep * step,
                        size: 0.1,
                        color: 'red'
                    });

                    //Iterate location
                    x += xStep * step;
                    //y += yStep * step;
                    z += zStep * step;
                }
            }
        }
    }
}