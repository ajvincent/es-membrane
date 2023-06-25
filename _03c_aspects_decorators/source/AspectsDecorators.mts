import type {
  SetReturnType,
} from "type-fest";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import argumentsTrap from "./methods/argumentsTrap.mjs";

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

export default class AspectsDecorators<This extends MethodsOnlyType> {
  argumentsTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<This[Key], void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return argumentsTrap<This, Key>(trapMethod);
  }
}
