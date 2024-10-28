import styles from "./SimulationSelector.module.css";
import Select from "react-select";
import React, {useEffect, useMemo, useState} from "react";
import {TILE_AIR, TILE_SET} from "../../../common/Tiles";
import {TNT_SIM_ENTRY} from "../../../funcs/sims/TNTBlast";
import NumericIncrementer from "../../../components/incrementer/NumericIncrementer";
import {useDispatch, useSelector} from "react-redux";
import {applySimEntries, selectTiles} from "../../../data/map/tileMap";
import {initEdits, SimEntryMap2D, TileMap2D} from "../../../api/Map2D";
import {incrementSimEdit} from "../../map/MapToolPage";
import {addSimEntry, setTileData} from "../../../funcs/TileFuncs";

export interface TestArgs {
    [key: string]: {
        /** Label to show users */
        label: string;
        /** Grouping to show users */
        section?: string;
        /** Tab to show users */
        tab?: string;
        /** Data type */
        type: 'int' | 'float' | 'bool';
        /** Default value */
        default: any;
    }
}

export interface TestArgValues {
    [key: string]: any
}

export interface TestTypeEntry {
    id: string;
    description: string;
    args: TestArgs;
    runner: (props: SimulationSelectorProps, tileMapGrid: TileMap2D, applyEdits: (edits: SimEntryMap2D) => void, args: TestArgValues) => void;
}

const testOptions: TestTypeEntry[] = [
    TNT_SIM_ENTRY,
    {
        id: "random:fill",
        description: "Fills entire map, mostly exists for testing the runtime",
        args: {},
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
                            newTile: tileToUse?.index === undefined ? TILE_AIR.index : tileToUse.index,
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
    addHeatMapHit: (x: number, y: number, hits: number) => void;
    onRun: () => void;
    hasRun: boolean;
}

export default function SimulationSelector(props: SimulationSelectorProps) {
    const [testToRun, setTestToRun] = useState<TestTypeEntry>(testOptions[0]);
    const [testArgs, setTestArgs] = useState<TestArgValues>({});

    const tiles = useSelector(selectTiles);
    const dispatch = useDispatch();

    useEffect(() => {
        const args: TestArgValues = {};
        if (testToRun?.args) {
            Object.keys(testToRun.args).forEach((key) => {
                args[key] = testToRun.args[key]?.default;
            })
        }
        setTestArgs(args);
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
        <div>
            <div className={styles.testHeader}>
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
            <div className={styles.testArgList}>
                <SimulationArgsSection
                    {...props}
                    testToRun={testToRun}
                    testArgs={testArgs}
                    setTestArg={setTestArg}
                />
            </div>
        </div>
    )
}

interface SimulationArgsSectionProps extends SimulationSelectorProps {
    testToRun: TestTypeEntry;
    testArgs: TestArgValues
    setTestArg: (key: string, value: any) => void
}

function SimulationArgsSection(props: SimulationArgsSectionProps,): React.JSX.Element {
    const {testToRun, testArgs, setTestArg} = props;
    const args = useMemo(() => {
        const keys = Object.keys(testToRun.args);
        return keys.map((key) => {
            return {
                ...testToRun.args[key],
                key
            }
        })
    }, [testToRun]);

    if (args.length === 0) {
        return <div>"No customization options"</div>
    }
    return (
        <React.Fragment>
            {
                args.map(arg => {
                    if (arg.type === 'int') {
                        const value = testArgs[arg.key] as number;
                        return (
                            <div className={styles.testArg}>
                                <div>{arg.label}</div>
                                <div>
                                    <NumericIncrementer
                                        key={`arg-${arg.key}`}
                                        whole={true}
                                        value={value}
                                        setValue={(v) => setTestArg(arg.key, v)}
                                        increments={[1, 5]} //TODO allow customizing per arg
                                    />
                                </div>
                            </div>
                        )
                    } else if (arg.type === 'float') {
                        const value = testArgs[arg.key] as number;
                        return (
                            <div className={styles.testArg}>
                                <div>{arg.label}</div>
                                <div>
                                    <NumericIncrementer
                                        key={`arg-${arg.key}`}
                                        whole={false}
                                        value={value}
                                        setValue={(v) => setTestArg(arg.key, v)}
                                        increments={[0.1, 1]} //TODO allow customizing per arg
                                    />
                                </div>
                            </div>
                        )
                    } else if (arg.type === 'bool') {
                        const value = testArgs[arg.key] as boolean;
                        return (
                            <div className={styles.testArg}>
                                <div>{arg.label}</div>
                                <div>
                                    <input
                                        key={`arg-${arg.key}`}
                                        type="checkbox"
                                        checked={value}
                                        onChange={(event) => setTestArg(arg.key, !value)}
                                    />
                                </div>
                            </div>
                        )
                    }
                    return <div>---{arg.key}---</div>
                })
            }
        </React.Fragment>
    )
}