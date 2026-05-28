import {isDefined} from "./isDefined";

export function getLastValue<OUTPUT, INPUT>(values: INPUT[], accessor: (value: INPUT) => OUTPUT): OUTPUT | undefined {
    for (let i = values.length - 1; i >= 0; i--) {
        const value = accessor(values[i]);
        if (isDefined(value)) {
            return value;
        }
    }
    return undefined;
}
