import styles from "../SimArg.module.css";
import React from "react";
import {TestArg} from "../../simulation/SimulationSelector";

export interface SimArgBoolProps {
    argData: TestArg;
    argValue: any;
    setArgValue: (argValue: any) => void;
}

export default function SimArgBool({argData, argValue, setArgValue}: SimArgBoolProps) {
    const value = argValue as boolean ?? argData.default;
    return (
        <div className={styles.box}>
            <div className={styles.label}>{argData.label}</div>
            <div>
                <input
                    type="checkbox"
                    checked={value ?? false}
                    onChange={(event) => setArgValue(!value)}
                />
            </div>
        </div>
    )
}