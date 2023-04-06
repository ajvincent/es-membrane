import type { MethodReturnRewrite } from "./MethodReturnRewrite.mjs";
import { CONTINUE } from "../shared-symbols.mjs";
export type BodyContinuableOnly<T> = MethodReturnRewrite<T, typeof CONTINUE, true>;
