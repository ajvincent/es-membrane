import type { MethodReturnRewrite } from "./MethodReturnRewrite.mjs";
export type NotImplementedOnly<T>  = MethodReturnRewrite<T, never, false>;
