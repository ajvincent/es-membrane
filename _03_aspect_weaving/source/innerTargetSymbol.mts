const INNER_TARGET_KEY = Symbol("inner target");
export default INNER_TARGET_KEY;

export type WrapWithInnerTargetKey<T extends object> = T & {[INNER_TARGET_KEY](target: T): void }
