import type { MethodsOnlyInternal } from "./MethodsOnlyInternal.mjs";
export type MethodsOnly<T> = T extends MethodsOnlyInternal ? T : never;
