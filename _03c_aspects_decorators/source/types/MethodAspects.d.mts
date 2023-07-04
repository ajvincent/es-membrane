import type {
  SetReturnType
} from "type-fest";

import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MethodsOnlyType
} from "#aspects/stubs/source/types/MethodsOnlyType.mjs";

import type {
  BodyTrapTypesBase,
  PrependedIndeterminate,
} from "./BodyTrapTypesBase.mjs";

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

  readonly bodyTraps: UnshiftableArray<
    PrependedIndeterminate<This, Key, BodyTrapTypesBase<This>[Key]>
  >;

  readonly returnTraps: UnshiftableArray<
    SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  >;
}
