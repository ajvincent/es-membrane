/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// #region preamble
import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  AssertInterface
} from "#stage_utilities/source/SharedAssertSet.mjs";

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
} from "../types/SharedVariablesDictionary.mjs";

import type {
  SharedVariablesDictionary
} from "../types/SharedVariablesDictionary.mjs";

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
import { ArgumentsTrap } from "../types/ArgumentsTrap.mjs";

import buildMethodStates from "./stateMachine.mjs";

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
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> implements MethodAspects<This, Key, SharedVariables>
{
  readonly preconditionTraps: UnshiftableArray<
    PreconditionWithContext<This, Key, unknown>
  > = [];

  readonly argumentTraps: UnshiftableArray<
    ArgumentsTrap<This, Key, SharedVariables>
  > = [];

  readonly bodyTraps: UnshiftableArray<
    PrependedIndeterminate<This, Key, SharedVariables>
  > = [];

  readonly returnTraps: UnshiftableArray<
    ReturnTrapMayOverride<This, Key, SharedVariables>
  > = [];

  readonly postconditionTraps: UnshiftableArray<
    PostconditionWithContext<This, Key, unknown>
  > = [];

  readonly stateMachine = buildMethodStates();
}

/**
 * A map of original methods to replacement methods
 * @internal
 * @remarks
 * This is how we collapse multiple method decorators which could replace the method, with only one replacement.
 */
const ReplaceableMethodsMap = new ReplaceableValueMap<
  Method<MethodsOnlyType, keyof MethodsOnlyType>,
  MethodAspectsDictionary<
    MethodsOnlyType,
    keyof MethodsOnlyType,
    SharedVariablesDictionary<MethodsOnlyType>[keyof MethodsOnlyType]
  >
>
(
  () => new MethodAspectsDictionary<
    MethodsOnlyType,
    keyof MethodsOnlyType,
    SharedVariablesDictionary<MethodsOnlyType>[keyof MethodsOnlyType]
  >
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
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
>
(
  method: Method<This, Key>
): Method<This, Key>
{
  function newMethod(
    this: This & AssertInterface,
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

    const sharedVariables = {};

    // argument traps
    aspectsDictionary.argumentTraps.forEach(trap => trap.call(this, sharedVariables, ...parameters));

    // body traps
    type ReturnOrIndeterminate = ReturnType<Method<This, Key>> | typeof INDETERMINATE;

    let rv: ReturnOrIndeterminate = INDETERMINATE;
    for (let i = 0; (i < aspectsDictionary.bodyTraps.length) && (rv === INDETERMINATE); i++) {
      const trap = aspectsDictionary.bodyTraps[i];
      rv = trap.call(
        this, sharedVariables, ...parameters
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
        This & AssertInterface,
        [SharedVariables, ReturnType<This[Key]>, ...Parameters<Method<This, Key>>],
        ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED
      >(this, sharedVariables as SharedVariables, rv as ReturnType<This[Key]>, ...parameters);
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
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
>
(
  method: Method<This, Key>
): ReplaceableValueType<Method<This, Key>, MethodAspectsDictionary<This, Key, SharedVariables>>
{
  const map = ReplaceableMethodsMap as unknown as ReplaceableValueMap<
    Method<This, Key>,
    MethodAspectsDictionary<This, Key, SharedVariables>
  >;
  return map.getDefault(
    method, oldMethod => GenericAspectFunction<This, Key, SharedVariables>(oldMethod)
  );
}
