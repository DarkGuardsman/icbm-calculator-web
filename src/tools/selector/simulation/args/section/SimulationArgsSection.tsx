import React, {useMemo} from "react";
import SimArgInt from "../../../args/int/SimArgInt";
import SimArgFloat from "../../../args/float/SimArgFloat";
import SimArgBool from "../../../args/bool/SimArgBool";
import {TestArg, TestArgSection, TestArgValues} from "../../SimulationSelector";
import {isDefined} from "../../../../../funcs/Helpers";
import styles from "./SimulationArgsSection.module.css";

export interface SimulationArgsSectionProps {
    section: TestArgSection; //TODO consider having redux back a section with it's arg data then have this component only get the section key
    entries: {[key: string]: TestArg}; //TODO pull from redux using a select that takes a single key
    values: TestArgValues //TODO have each arg pull from redux directly to avoid re-renders of the section
    setValue: (key: string, value: any) => void //TODO handle via redux in each arg component
}

export default function SimulationArgsSection({section, entries, values, setValue}: SimulationArgsSectionProps) {
    const argsToRender = useMemo(() => section.args.map(key => entries[key] ?? {key}), [section, entries]);

    return (
        <div className={styles.section}>
            <div className={styles.label}>{section.label}</div>
            <div className={styles.args}>
            {
                argsToRender.map(arg => {
                    if(!isDefined(arg.type)) {
                        return <div>No Arg Data For: '{arg.key}'</div>
                    }
                    else if (arg.type === 'int') {
                        return <SimArgInt
                            key={`test-arg-int-${arg.key}`}
                            argData={arg}
                            argValue={values[arg.key]}
                            setArgValue={(v) => setValue(arg.key, v)}
                        />
                    } else if (arg.type === 'float') {
                        return <SimArgFloat
                            key={`test-arg-float-${arg.key}`}
                            argData={arg}
                            argValue={values[arg.key]}
                            setArgValue={(v) => setValue(arg.key, v)}
                        />
                    } else if (arg.type === 'bool') {
                        return <SimArgBool
                            key={`test-arg-bool-${arg.key}`}
                            argData={arg}
                            argValue={values[arg.key]}
                            setArgValue={(v) => setValue(arg.key, v)}
                        />
                    }
                    return <div>---{arg.key}---</div>
                })
            }
            </div>
        </div>
    )
}