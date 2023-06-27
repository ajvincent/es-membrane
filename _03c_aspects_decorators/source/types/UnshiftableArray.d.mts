export type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "unshift">;
