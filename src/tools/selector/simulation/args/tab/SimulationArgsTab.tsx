import {TestArg, TestArgTab, TestArgValues} from "../../SimulationSelector";
import SimulationArgsSection from "../section/SimulationArgsSection";
import styles from "./SimulationArgsTab.module.css"

export interface SimulationArgsTabProps {
    tab: TestArgTab;
    entries: { [key: string]: TestArg };
    values: TestArgValues
    setValue: (key: string, value: any) => void
}

export default function SimulationArgTab({tab, entries, values, setValue}: SimulationArgsTabProps) {
    return (
        <div className={styles.tab}>
            {
                tab.sections.map((section, i) =>
                    <SimulationArgsSection
                        key={`sim-arg-section-${i}`}
                        section={section}
                        entries={entries}
                        values={values}
                        setValue={setValue}
                    />
                )
            }
        </div>
    )
}