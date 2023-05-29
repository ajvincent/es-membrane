import type { MethodReturnRewrite } from "#stub_classes/source/base/types/MethodReturnRewrite.mjs";
import { CONTINUE } from "../shared-symbols.mjs";
export type BodyContinuableOnly<T> = MethodReturnRewrite<T, typeof CONTINUE, true>;
