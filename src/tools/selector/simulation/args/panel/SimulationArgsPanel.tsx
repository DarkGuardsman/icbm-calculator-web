import React, {useEffect, useMemo, useState} from "react";
import {isDefined} from "../../../../../funcs/Helpers";
import {TestArg, TestArgValues, TestTypeEntry} from "../../SimulationSelector";
import SimulationArgTab from "../tab/SimulationArgsTab";
import styles from "./SimulationArgsPanel.module.css"

export interface SimulationArgsSectionProps {
    testToRun: TestTypeEntry;
    testArgs: TestArgValues
    setTestArg: (key: string, value: any) => void
}

export default function SimulationArgsPanel(props: SimulationArgsSectionProps): React.JSX.Element {
    const {testToRun, testArgs, setTestArg} = props;

    const [currentTab, setCurrentTab] = useState<number>(0);

    const entries = useMemo<{[key:string]: TestArg}>(() => {
        const map: {[key:string]: TestArg} = {};
        testToRun.args?.data.forEach((arg) => {
            map[arg.key] = arg;
        })
        return map;
    }, [testToRun])

    useEffect(() => {
        setCurrentTab(0);
    }, [testToRun]);

    if (!isDefined(testToRun.args) || testToRun.args.data.length === 0 || testToRun.args.tabs.length === 0) {
        return <div>No customization options</div>
    }
    return (
        <div className={styles.panel}>
            <div className={styles.tabs}>
                {testToRun.args.tabs.map((tab, i) =>
                    <div className={styles.tabEntry + (i === currentTab ? " " + styles.tabCurrent : "")}>
                        <button
                            className={styles.tabButton}
                            onClick={() => setCurrentTab(i)}
                        >
                            {tab.label}
                        </button>
                    </div>
                )}
            </div>
            <div className={styles.contents}>
                <SimulationArgTab
                    tab={testToRun.args.tabs[currentTab]}
                    entries={entries}
                    values={testArgs}
                    setValue={setTestArg}
                />
            </div>
        </div>
    )
}