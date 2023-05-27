import type { MethodReturnRewrite } from "../../stub-generators/base/types/MethodReturnRewrite.mjs";
import { CONTINUE } from "../shared-symbols.mjs";
export type BodyContinuableOnly<T> = MethodReturnRewrite<T, typeof CONTINUE, true>;
