import type {
  SetReturnType
} from "type-fest";

import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  SharedVariablesDictionary,
  PrependedIndeterminate,
} from "./SharedVariablesDictionary.mjs";

import type {
  PrependArgumentsMethod
} from "./PrependArguments.d.mts";

import type {
  PreconditionWithContext,
  PostconditionWithContext,
} from "./PrePostConditionsContext.mjs";

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
  readonly preconditionTraps: UnshiftableArray<
    PreconditionWithContext<This, Key, unknown>
  >;

  readonly argumentTraps: UnshiftableArray<SetReturnType<Method<This, Key>, void>>;

  readonly bodyTraps: UnshiftableArray<
    PrependedIndeterminate<This, Key, SharedVariablesDictionary<This>[Key]>
  >;

  readonly returnTraps: UnshiftableArray<
    SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  >;

  readonly postconditionTraps: UnshiftableArray<
    PostconditionWithContext<This, Key, unknown>
  >;
}
