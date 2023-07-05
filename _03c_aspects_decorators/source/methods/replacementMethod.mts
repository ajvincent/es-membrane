/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// #region preamble
import type {
  SetReturnType
} from "type-fest";

import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import ReplaceableValueMap, { ReplaceableValueType } from "#stage_utilities/source/ReplaceableValueMap.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  Method,
  MethodAspects,
} from "../types/MethodAspects.mjs";

import type {
  PrependedIndeterminate
} from "../types/BodyTrapTypesBase.mjs";

import type {
  BodyTrapTypesBase
} from "../types/BodyTrapTypesBase.mjs";

import type {
  ReturnTrapMayOverride
} from "../types/ReturnTrap.mjs";

import type {
  PreconditionWithContext,
  PostconditionWithContext,
} from "../types/PrePostConditionsContext.mjs";

import {
  PrePostConditionsContext,
} from "./prePostCondition.mjs";

import { INDETERMINATE, RETURN_NOT_REPLACED } from "../symbol-keys.mjs";

// #endregion preamble

/**
 * Storage for aspects we install via class method decorators.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @internal
 */
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
    ReturnTrapMayOverride<This, Key>
  > = [];

  readonly postconditionTraps: UnshiftableArray<
    PostconditionWithContext<This, Key, unknown>
  > = [];
}

/**
 * A map of original methods to replacement methods
 * @internal
 * @remarks
 * This is how we collapse multiple method decorators which could replace the method, with only one replacement.
 */
const ReplaceableMethodsMap = new ReplaceableValueMap<
  Method<MethodsOnlyType, keyof MethodsOnlyType>,
  MethodAspectsDictionary<MethodsOnlyType, keyof MethodsOnlyType>
>
(
  () => new MethodAspectsDictionary<MethodsOnlyType, keyof MethodsOnlyType>
);

/**
 * Drive aspects from class method decorators, including calling the original function.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param method - the method we're running aspects for.
 * @internal
 */
function GenericAspectFunction<
  This extends MethodsOnlyType,
  Key extends keyof This
>
(
  method: Method<This, Key>
): Method<This, Key>
{
  function newMethod(
    this: This,
    ...parameters: Parameters<Method<This, Key>>
  ): ReturnType<Method<This, Key>>
  {
    const { userContext: aspectsDictionary } = ReplaceableMethodsMap.get(method);
    const conditionsContextMap = new WeakMap<
      PostconditionWithContext<MethodsOnlyType, keyof MethodsOnlyType, unknown>,
      PrePostConditionsContext<unknown>
    >;

    // preconditions
    for (let i = aspectsDictionary.postconditionTraps.length - 1; i >= 0; i--) {
      const context = new PrePostConditionsContext<unknown>;
      const postcondition = aspectsDictionary.postconditionTraps[i];
      conditionsContextMap.set(postcondition, context);

      const precondition = aspectsDictionary.preconditionTraps[i];
      precondition.apply(this, [context, ...parameters]);
    }

    // argument traps
    aspectsDictionary.argumentTraps.forEach(trap => trap.apply(this, parameters));

    // body traps
    type ReturnOrIndeterminate = ReturnType<Method<This, Key>> | typeof INDETERMINATE;

    let rv: ReturnOrIndeterminate = INDETERMINATE;
    const sharedArguments = {};
    for (let i = 0; (i < aspectsDictionary.bodyTraps.length) && (rv === INDETERMINATE); i++) {
      const trap = aspectsDictionary.bodyTraps[i];
      rv = trap.call(
        this, sharedArguments, ...parameters
      );
    }
    if (rv === INDETERMINATE) {
      rv = method.apply(this, parameters);
    }
    if (rv === INDETERMINATE) {
      throw new Error("unreachable");
    }

    // return traps
    type ReturnOrReplace = ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED;
    for (let i = 0; i < aspectsDictionary.returnTraps.length; i++) {
      const trap = aspectsDictionary.returnTraps[i];
      const maybeReplaceRV: ReturnOrReplace = trap.call<
        This,
        [ReturnType<This[Key]>, ...Parameters<Method<This, Key>>],
        ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED
      >(this, rv as ReturnType<This[Key]>, ...parameters);
      if (maybeReplaceRV !== RETURN_NOT_REPLACED)
        rv = maybeReplaceRV;
    }

    if (rv === INDETERMINATE) {
      throw new Error("unreachable");
    }

    // postcondition traps
    aspectsDictionary.postconditionTraps.forEach(trap => {
      const context = conditionsContextMap.get(trap) as PrePostConditionsContext<unknown>;
      trap.apply(this, [context, rv, ...parameters]);
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return rv;
  }

  return newMethod as Method<This, Key>;
}

/**
 * Get a replacement method, and aspects dictionary for the same, relating to a decorated method.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param method - the method to wrap.
 */
export default function getReplacementMethodAndAspects<
  This extends MethodsOnlyType,
  Key extends keyof This
>
(
  method: Method<This, Key>
): ReplaceableValueType<Method<This, Key>, MethodAspectsDictionary<This, Key>>
{
  const map = ReplaceableMethodsMap as unknown as ReplaceableValueMap<
    Method<This, Key>,
    MethodAspectsDictionary<This, Key>
  >;
  return map.getDefault(
    method, oldMethod => GenericAspectFunction<This, Key>(oldMethod)
  );
}
