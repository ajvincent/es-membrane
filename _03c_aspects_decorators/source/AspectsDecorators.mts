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
import returnTrap from "./methods/returnTrap.mjs";

export default class AspectsDecorators<
  This extends MethodsOnlyType
>
{
  argumentsTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<This[Key], void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return argumentsTrap<This, Key>(trapMethod);
  }

  returnTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return returnTrap<This, Key>(trapMethod);
  }
}
