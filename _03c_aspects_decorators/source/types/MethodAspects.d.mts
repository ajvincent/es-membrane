import type {
  SetReturnType
} from "type-fest";

import type {
  MethodsOnlyType
} from "#aspects/stubs/source/types/MethodsOnlyType.mjs";

import type {
  PushableArray
} from "./PushableArray.mjs";

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
  readonly argumentTraps: PushableArray<SetReturnType<Method<This, Key>, void>>;
}
