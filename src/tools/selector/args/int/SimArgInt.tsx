import styles from "../SimArg.module.css";
import NumericIncrementer from "../../../../components/incrementer/NumericIncrementer";
import React from "react";
import {TestArg} from "../../simulation/SimulationSelector";

export interface SimArgIntProps {
    argData: TestArg;
    argValue: any;
    setArgValue: (argValue: any) => void;
}

export default function SimArgInt({argData, argValue, setArgValue}: SimArgIntProps) {
    const value = typeof argValue === 'number' ? argValue as number : 0;
    return (
        <div className={styles.box}>
            <div className={styles.label}>{argData.label}</div>
            <div>
                <NumericIncrementer
                    whole={true}
                    value={value}
                    setValue={(v) => setArgValue(v)}
                    increments={[1, 5]} //TODO allow customizing per arg
                />
            </div>
        </div>
    )
}