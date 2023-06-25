import { MethodsOnlyType } from "#mixin_decorators/source/types/MethodsOnlyType.mjs";
import { SetReturnType } from "type-fest";
import argumentsTrap from "./methods/argumentsTrap.mjs";
import { ClassMethodDecorator } from "#mixin_decorators/source/types/ClassMethodDecorator.mjs";

export default class AspectsDecorators<This extends MethodsOnlyType> {
  argumentsTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<This[Key], void>
  ): ClassMethodDecorator<This, Key, true, false>
  {
    return argumentsTrap<This, Key>(trapMethod);
  }
}
