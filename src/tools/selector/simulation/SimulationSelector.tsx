import styles from "./SimulationSelector.module.css";
import Select from "react-select";
import React, {useEffect, useState} from "react";
import {TILE_AIR, TILE_SET} from "../../../common/Tiles";
import {TNT_SIM_ENTRY} from "../../../funcs/sims/TNTBlast";
import {useDispatch, useSelector} from "react-redux";
import {applySimEntries, selectTiles} from "../../../data/map/tileMap";
import {initEdits, SimEntryMap2D, TileMap2D} from "../../../api/Map2D";
import {incrementSimEdit} from "../../map/MapToolPage";
import {addSimEntry} from "../../../funcs/TileFuncs";
import ValueDefined from "../../../components/ValueDefined";
import SimulationArgsPanel from "./args/panel/SimulationArgsPanel";
import {NUKE_SIM_ENTRY, SONIC_ENTRY, THERMOBARIC_ENTRY} from "../../../funcs/sims/LargeBlast";
import {ANTIMATTER_ENTRY} from "../../../funcs/sims/AntimatterBlast";
import {DEPTH_FIRST_EXPAND} from "../../../funcs/sims/DepthFirstPath";

export interface TestArgs {
    tabs: TestArgTab[];
    data: TestArg[];
}

export interface TestArgTab {
    label: string;
    sections: TestArgSection[]
}

export interface TestArgSection {
    label: string;
    args: string[];
}

export interface TestArg {
    /** Unique key */
    key: string;
    /** Label to show users */
    label: string;
    /** Data type */
    type: 'int' | 'float' | 'bool';
    /** Default value */
    default: any;
}

export interface TestArgValues {
    [key: string]: any
}

export interface TestTypeEntry {
    id: string;
    /** Short description of the test */
    description: string;
    /** Expanded information about the test, often shared between several tests */
    expandedInfo?: string;
    args?: TestArgs;
    runner: (props: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => void;
}

const testOptions: TestTypeEntry[] = [
    TNT_SIM_ENTRY,
    SONIC_ENTRY,
    THERMOBARIC_ENTRY,
    NUKE_SIM_ENTRY,
    ANTIMATTER_ENTRY,
    DEPTH_FIRST_EXPAND,
    {
        id: "random:fill",
        description: "Fills entire map, mostly exists for testing the runtime",
        args: undefined,
        runner: (props: SimulationSelectorProps, _: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void) => {
            const edits: SimEntryMap2D = initEdits();
            const sourceId = `random:fill-${Date.now()}`;
            let editIndex = 0;

            for (let y = 0; y < props.gridSizeY; y++) {
                for (let x = 0; x < props.gridSizeX; x++) {
                    const tileToUse = TILE_SET
                        .filter(t => t !== TILE_AIR)
                        .find((t, i) => {
                            const index = Math.floor(Math.random() * (TILE_SET.length - 1));
                            return i === index;
                        });
                    addSimEntry(edits,
                        {
                            x,
                            y,
                            edit: {
                                newTile: tileToUse?.index === undefined ? TILE_AIR.index : tileToUse.index,
                            },
                            index: incrementSimEdit(),
                            meta: {
                                source: {
                                    key: sourceId,
                                    phase: 'loop',
                                    index: editIndex++
                                }
                            }
                        }
                    );
                }
            }
            applyEdits(edits);
        }
    }
]

export interface SimulationSelectorProps {
    gridSizeX: number;
    gridSizeY: number;
    onRun: () => void;
    hasRun: boolean;
}

export default function SimulationSelector(props: SimulationSelectorProps) {
    const [testToRun, setTestToRun] = useState<TestTypeEntry>(testOptions[0]);
    const [testArgs, setTestArgs] = useState<TestArgValues>({});

    const tiles = useSelector(selectTiles);
    const dispatch = useDispatch();

    useEffect(() => {
        const testData: TestArgValues = {};
        if (testToRun?.args?.data) {
            testToRun.args.data.forEach((arg) => {
                testData[arg.key] = arg.default;
            })
        }
        setTestArgs(testData);
    }, [testToRun]);

    const runSimulation = () => {
        if (testToRun?.id === undefined) {
            return;
        }

        props.onRun();
        console.log(`Running ${testToRun.id} with args`, testArgs);
        const start = performance.now();
        testToRun.runner(props, tiles, (edits) => dispatch(applySimEntries(edits)), testArgs);
        console.log(`Finished ${testToRun.id} in`, performance.now() - start);

    };

    const setTestArg = (key: string, value: any) => {
        setTestArgs(prev => {
            return {
                ...prev,
                [key]: value
            }
        })
    };

    return (
        <div className={styles.simulationPanel}>
            <div className={styles.testHeader}>
                <div className={styles.testSelectLabel}>Test:</div>
                <div className={styles.testSelector}>

                    <Select
                        options={testOptions}
                        value={testToRun}
                        getOptionValue={(tile: TestTypeEntry) => tile.id}
                        getOptionLabel={(tile: TestTypeEntry) => tile.id}
                        onChange={(value) => {
                            if (value) setTestToRun(value)
                        }}
                    />
                </div>
                <div className={styles.testDescription}>Description: {testToRun?.description}</div>
                <div className={styles.testRunButton}>
                    <button onClick={runSimulation} disabled={props.hasRun || testToRun?.id === undefined}>RUN</button>
                </div>
            </div>
            <div className={styles.argPanel}>
                <ValueDefined value={testToRun.args}>
                    <SimulationArgsPanel
                        testToRun={testToRun}
                        testArgs={testArgs}
                        setTestArg={setTestArg}
                    />
                </ValueDefined>
            </div>
        </div>
    )
}





