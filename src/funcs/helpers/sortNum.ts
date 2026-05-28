import {isDefined} from "./isDefined";

export function sortNum(a: number | undefined, b: number | undefined): number {
    if (!isDefined(a)) {
        return isDefined(b) ? -1 : 0;
    } else if (!isDefined(b)) {
        return isDefined(a) ? 1 : 0;
    }
    return a - b;
}
