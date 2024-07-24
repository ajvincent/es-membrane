import type {
  ClassDecoratorFunction
} from "../types/ClassDecoratorFunction.js";

import ObjectGraphTailHandler from "../generated/ObjectGraphTailHandler.js";

export default function UpdateShadowTarget(
  baseClass: typeof ObjectGraphTailHandler,
  context: ClassDecoratorContext
): typeof ObjectGraphTailHandler
{
  class UpdateShadowTarget extends baseClass
  {
    static #undefinedDescriptor = Object.freeze({
      value: undefined,
      writable: true,
      enumerable: false,
      configurable: true,
    });

    public ownKeys(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object
    ): (string | symbol)[]
    {
      if (Reflect.isExtensible(shadowTarget) === false)
        return Reflect.ownKeys(shadowTarget);

      const result: (string | symbol)[] = super.ownKeys(shadowTarget, nextGraphKey, nextTarget);

      const returnedKeys = new Set<string | symbol>(result);
      const shadowKeys = new Set<string | symbol>(Reflect.ownKeys(shadowTarget));
      for (const unwantedKey of shadowKeys.difference(returnedKeys)) {
        Reflect.deleteProperty(shadowTarget, unwantedKey);
      }
      for (const discoveredKey of returnedKeys.difference(shadowKeys)) {
        Reflect.defineProperty(shadowTarget, discoveredKey, UpdateShadowTarget.#undefinedDescriptor);
      }

      return result;
    }
  }
  return UpdateShadowTarget;
}
UpdateShadowTarget satisfies ClassDecoratorFunction<
  typeof ObjectGraphTailHandler,
  true,
  false
>;
