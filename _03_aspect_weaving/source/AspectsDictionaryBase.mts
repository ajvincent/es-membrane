import type {
  PushableArray
} from "../../_01_stage_utilities/source/types/Utility.mjs";

import {
  NOT_DEFINED,
  MaybeDefined,
  assertNotDefined,
  markDefined,
  assertDefined,
} from "../../_01_stage_utilities/source/maybeDefined.mjs";

import type {
  MethodsOnlyInternal
} from "../../_02_stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly
} from "../../_02_stub_classes/source/base/types/export-types.mjs";

class AspectsDictionary<T extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<VoidMethodsOnly<T>> = [];
}

export const ASPECTS_KEY = Symbol("aspects");
export const INNER_TARGET_KEY = Symbol("inner target");
export const INNER_TARGET_SETTER = Symbol("inner target setter");

export default
class AspectsDictionaryBase<T extends MethodsOnlyInternal> {
  readonly [ASPECTS_KEY] = new AspectsDictionary<T>;

  #innerTarget: MaybeDefined<T> = NOT_DEFINED;
  get [INNER_TARGET_KEY](): T {
    return assertDefined<T>(this.#innerTarget);
  }

  [INNER_TARGET_SETTER](innerTarget: T): void {
    assertNotDefined<T>(this.#innerTarget);
    this.#innerTarget = markDefined<T>(innerTarget);
  }
}
