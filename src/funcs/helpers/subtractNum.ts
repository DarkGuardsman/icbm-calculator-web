import {isDefined} from "./isDefined";

export function subtractNum(a: number | undefined, b: number | undefined): number | undefined {
    if(!isDefined(a) || Number.isNaN(a)) {
        return b;
    }
    else if(!isDefined(b)  || Number.isNaN(b)) {
        return a;
    }
    return a - b;
}
