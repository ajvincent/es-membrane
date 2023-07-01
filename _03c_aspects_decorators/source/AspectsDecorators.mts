import type {
  SetReturnType,
} from "type-fest";

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  PrependArgumentsMethod
} from "./types/PrependArguments.mjs";

import argumentsTrap from "./methods/argumentsTrap.mjs";
import bodyTrap from "./methods/bodyTrap.mjs";
import returnTrap from "./methods/returnTrap.mjs";
import {
  prePostCondition,
  preCondition,
  postCondition,
} from "./methods/prePostCondition.mjs";

import type {
  PreconditionWithContext,
  PostconditionWithContext,
  PreconditionWithoutContext,
  PostconditionWithoutContext,
} from "./types/PrePostConditionsContext.mjs";

import type {
  BodyTrapTypesBase,
  PrependedIndeterminate,
} from "./types/BodyTrapTypesBase.mjs";

export default class AspectsDecorators<
  This extends MethodsOnlyType,
  BodyTrapTypes extends BodyTrapTypesBase<This>,
>
{
  argumentsTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<This[Key], void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return argumentsTrap<This, Key>(trapMethod);
  }

  bodyTrap<Key extends keyof This>(
    this: void,
    trapMethod: PrependedIndeterminate<This, Key, BodyTrapTypes[Key]>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return bodyTrap<This, Key, BodyTrapTypes[Key]>(trapMethod);
  }

  returnTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return returnTrap<This, Key>(trapMethod);
  }

  prePostCondition<Key extends keyof This, ConditionsContext>(
    this: void,
    preTrapMethod: PreconditionWithContext<This, Key, ConditionsContext>,
    postTrapMethod: PostconditionWithContext<This, Key, ConditionsContext>,
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return prePostCondition<This, Key, ConditionsContext>(preTrapMethod, postTrapMethod);
  }

  preCondition<Key extends keyof This>(
    this: void,
    preTrapMethod: PreconditionWithoutContext<This, Key>,
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return preCondition<This, Key>(preTrapMethod);
  }

  postCondition<Key extends keyof This>(
    this: void,
    postTrapMethod: PostconditionWithoutContext<This, Key>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return postCondition<This, Key>(postTrapMethod);
  }
}
