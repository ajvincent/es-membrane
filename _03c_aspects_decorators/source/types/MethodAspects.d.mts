import type {
  SetReturnType
} from "type-fest";

import type {
  MethodsOnlyType
} from "#aspects/stubs/source/types/MethodsOnlyType.mjs";

import type {
  UnshiftableArray
} from "./UnshiftableArray.mjs";

import type {
  PrependArgumentsMethod
} from "./PrependArguments.d.mts";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Method<
  This extends MethodsOnlyType,
  Key extends keyof This,
> = This[Key];

export interface MethodAspects<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
{
  readonly argumentTraps: UnshiftableArray<SetReturnType<Method<This, Key>, void>>;

  readonly returnTraps: UnshiftableArray<
    SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  >;
}
