/* eslint-disable @typescript-eslint/no-explicit-any */

// #region preamble
import type {
  SetReturnType
} from "type-fest";

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
  PushableArray
} from "../types/PushableArray.mjs";

// #endregion preamble

class MethodAspectsDictionary<
  This extends MethodsOnlyType,
  Key extends keyof This,
> implements MethodAspects<This, Key>
{
  readonly argumentTraps: PushableArray<
    SetReturnType<Method<This, Key>, void>
  > = [];
}

const ReplaceableMethodsMap = new ReplaceableValueMap<
  Method<MethodsOnlyType, keyof MethodsOnlyType>,
  MethodAspectsDictionary<MethodsOnlyType, keyof MethodsOnlyType>
>
(
  MethodAspectsDictionary<MethodsOnlyType, keyof MethodsOnlyType>
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
    const { userContext: aspectContext, } = ReplaceableMethodsMap.get(method);

    aspectContext.argumentTraps.forEach(trap => trap.apply(this, parameters));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rv: ReturnType<typeof method> = method.apply(this, parameters);
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
