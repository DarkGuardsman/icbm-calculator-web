export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

export function firstDefined<T>(...values: T[]): T | undefined {
    return isDefined(values) ? values.find(isDefined) : undefined
}

export function valueOr<T>(first: T | undefined | null, backup: T): T {
    return isDefined(first) ? first as T : backup;
}

export function sortNum(a: number | undefined, b: number | undefined): number {
    if (!isDefined(a)) {
        return isDefined(b) ? -1 : 0;
    } else if (!isDefined(b)) {
        return isDefined(a) ? 1 : 0;
    }
    return a - b;
}

export function getLastValue<OUTPUT, INPUT>(values: INPUT[], accessor: (value: INPUT) => OUTPUT): OUTPUT | undefined {
    for (let i = values.length - 1; i >= 0; i--) {
        const value = accessor(values[i]);
        if (isDefined(value)) {
            return value;
        }
    }
    return undefined;
}

export function addNum(a: number | undefined, b: number | undefined): number | undefined {
    if(!isDefined(a) || Number.isNaN(a)) {
        return b;
    }
    else if(!isDefined(b)  || Number.isNaN(b)) {
        return a;
    }
    return a + b;
}

export function subtractNum(a: number | undefined, b: number | undefined): number | undefined {
    if(!isDefined(a) || Number.isNaN(a)) {
        return b;
    }
    else if(!isDefined(b)  || Number.isNaN(b)) {
        return a;
    }
    return a - b;
}