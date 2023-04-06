import type { MethodReturnRewrite } from "./MethodReturnRewrite.mjs";
export type VoidMethodsOnly<T> = MethodReturnRewrite<T, void, false>;
