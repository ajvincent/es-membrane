import type { Class } from "type-fest";

import type {
  PushableArray
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  WrapThisAndParameters
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ASPECTS_KEY
} from "./symbol-keys.mjs";

export type ClassWithAspects<T extends MethodsOnlyInternal> = Class<T> & {
  readonly [ASPECTS_KEY]: AspectsDictionary<T>;
}

export default
class AspectsDictionary<T extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<WrapThisAndParameters<T>> = [];
}
