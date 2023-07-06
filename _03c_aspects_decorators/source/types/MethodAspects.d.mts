import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  ArgumentsTrap
} from "./ArgumentsTrap.mjs";

import type {
  SharedVariablesDictionary,
  PrependedIndeterminate,
} from "./SharedVariablesDictionary.mjs";

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
  SharedVariables extends SharedVariablesDictionary<This>[Key]
>
{
  readonly preconditionTraps: UnshiftableArray<
    PreconditionWithContext<This, Key, unknown>
  >;

  readonly argumentTraps: UnshiftableArray<
    ArgumentsTrap<This, Key, SharedVariables>
  >;

  readonly bodyTraps: UnshiftableArray<
    PrependedIndeterminate<This, Key, SharedVariables>
  >;

  readonly returnTraps: UnshiftableArray<
    ReturnTrapMayOverride<This, Key, SharedVariables>
  >;

  readonly postconditionTraps: UnshiftableArray<
    PostconditionWithContext<This, Key, unknown>
  >;
}
