export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

export function firstDefined<T>(...values: T[]): T | undefined {
    return isDefined(values) ? values.find(isDefined) : undefined
}

export function valueOr<T>(first: T | undefined | null, backup: T): T {
    return isDefined(first) ? first as T : backup;
}