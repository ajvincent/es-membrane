export type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
