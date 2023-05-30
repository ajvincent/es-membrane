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

/*
This can't work as-is.

The intent is for each aspect to get `this` as an instance of T.  In testing,
I was using `methodName.apply(this, ...)`, which broke the aspect's `this`.
So if I pass in a Spy class, with a reference to `this.#spyBase`, the method just
can't access the private field.

So now I need to do some redesigning.  Aspect-oriented programming is hard.
*/
export default
class AspectsDictionary<T extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<WrapThisAndParameters<T>> = [];
}
