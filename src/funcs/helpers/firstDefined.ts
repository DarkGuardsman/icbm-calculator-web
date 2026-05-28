import {isDefined} from "./isDefined";

export function firstDefined<T>(...values: T[]): T | undefined {
    return isDefined(values) ? values.find(isDefined) : undefined
}
