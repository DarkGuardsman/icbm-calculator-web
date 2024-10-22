import styles from "./SimulationSelector.module.css";
import Select from "react-select";
import {useState} from "react";
import {TILE_AIR, TILE_SET} from "../../../common/Tiles";
import {DebugDotData, DebugLineData} from "../../../graph/GraphRender";
import tntBlast from "../../../funcs/sims/TNTBlast";

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
            tntBlast(16, 16, 6, true, tiles, setTile, addDot, addLine);
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