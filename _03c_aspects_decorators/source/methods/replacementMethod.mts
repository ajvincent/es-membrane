/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

// #region preamble
import type {
  SetReturnType
} from "type-fest";

import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import ReplaceableValueMap from "#stage_utilities/source/ReplaceableValueMap.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  GenericFunction
} from "../types/GenericFunction.mjs";

import type {
  Method,
  MethodAspects,
} from "../types/MethodAspects.mjs";

import type {
  PrependArgumentsMethod,
} from "../types/PrependArguments.mjs";

import type {
  PrependedIndeterminate
} from "../types/BodyTrapTypesBase.mjs";

import type {
  BodyTrapTypesBase
} from "../types/BodyTrapTypesBase.mjs";

import type {
  PreconditionWithContext,
  PostconditionWithContext,
} from "../types/PrePostConditionsContext.mjs";

import {
  PrePostConditionsContext,
} from "./prePostCondition.mjs";

import { INDETERMINATE } from "../symbol-keys.mjs";

// #endregion preamble

export class MethodAspectsDictionary<
  This extends MethodsOnlyType,
  Key extends keyof This,
> implements MethodAspects<This, Key>
{
  readonly preconditionTraps: UnshiftableArray<
    PreconditionWithContext<This, Key, unknown>
  > = [];

  readonly argumentTraps: UnshiftableArray<
    SetReturnType<Method<This, Key>, void>
  > = [];

  readonly bodyTraps: UnshiftableArray<
    PrependedIndeterminate<This, Key, BodyTrapTypesBase<This>[Key]>
  > = [];

  readonly returnTraps: UnshiftableArray<
    SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  > = [];

  readonly postconditionTraps: UnshiftableArray<
    PostconditionWithContext<This, Key, unknown>
  > = [];
}

const ReplaceableMethodsMap = new ReplaceableValueMap<
  Method<MethodsOnlyType, keyof MethodsOnlyType>,
  MethodAspectsDictionary<MethodsOnlyType, keyof MethodsOnlyType>
>
(
  () => new MethodAspectsDictionary
);

function GenericAspectFunction(
  method: GenericFunction
): typeof method
{
  return function newMethod(
    this: ThisParameterType<typeof method>,
    ...parameters: Parameters<typeof method>
  ): ReturnType<typeof method>
  {
    const { userContext: aspectContext } = ReplaceableMethodsMap.get(method);
    const conditionsContextMap = new WeakMap<
      PostconditionWithContext<MethodsOnlyType, keyof MethodsOnlyType, unknown>,
      PrePostConditionsContext<unknown>
    >;

    for (let i = aspectContext.postconditionTraps.length - 1; i >= 0; i--) {
      const context = new PrePostConditionsContext<unknown>;
      const postcondition = aspectContext.postconditionTraps[i];
      conditionsContextMap.set(postcondition, context);

      const precondition = aspectContext.preconditionTraps[i];
      precondition.apply(this, [context, ...parameters]);
    }

    aspectContext.argumentTraps.forEach(trap => trap.apply(this, parameters));

    type ReturnOrIndeterminate = ReturnType<typeof method> | typeof INDETERMINATE;
    let rv: ReturnType<typeof method>, rvSet = false;
    const sharedArguments = {};
    for (let i = 0; i < aspectContext.bodyTraps.length; i++) {
      const trap = aspectContext.bodyTraps[i];
      const maybeRv: ReturnOrIndeterminate = trap.call(
        this, sharedArguments, ...parameters
      );

      if (maybeRv !== INDETERMINATE) {
        rv = maybeRv;
        rvSet = true;
        break;
      }
    }
    if (!rvSet) {
      rv = method.apply(this, parameters);
    }

    aspectContext.returnTraps.forEach(
      trap => trap.call(this, rv, ...parameters)
    );

    aspectContext.postconditionTraps.forEach(trap => {
      const context = conditionsContextMap.get(trap) as PrePostConditionsContext<unknown>;
      trap.apply(this, [context, rv, ...parameters]);
    });

    return rv;
  }
}

export default function getReplacementMethodAndAspects(
  method: GenericFunction
): ReturnType<typeof ReplaceableMethodsMap["getDefault"]>
{
  return ReplaceableMethodsMap.getDefault(
    method, oldMethod => GenericAspectFunction(oldMethod)
  );
}
