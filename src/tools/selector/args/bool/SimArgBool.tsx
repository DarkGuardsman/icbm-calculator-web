import styles from "../../simulation/SimulationSelector.module.css";
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
        <div className={styles.testArg} >
            <div>{argData.label}</div>
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