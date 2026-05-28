import {isDefined} from "./isDefined";

export function valueOr<T>(first: T | undefined | null, backup: T): T {
    return isDefined(first) ? first as T : backup;
}
