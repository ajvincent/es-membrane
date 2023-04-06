import type { MethodsOnlyInternal } from "../private-types/MethodsOnlyInternal.mjs";
export type MethodsOnly<T> = T extends MethodsOnlyInternal ? T : never;
