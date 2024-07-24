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

    public isExtensible(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object
    ): boolean
    {
      if (Reflect.isExtensible(shadowTarget) === false) {
        return false;
      }

      const result: boolean = super.isExtensible(shadowTarget, nextGraphKey, nextTarget);
      if (result === false) {
        this.#lockShadowTarget(shadowTarget, nextGraphKey, nextTarget);
      }

      return result;
    }

    /**
     * @see {@link https://262.ecma-international.org/#sec-proxy-object-internal-methods-and-internal-slots-ownpropertykeys | ECMA-262, 15th edition, June 2024: Proxy\[\[OwnKeyPropertyKeys\]\]}
     */
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

      /* ECMAScript 2024
      for (const unwantedKey of shadowKeys.difference(returnedKeys)) {
        Reflect.deleteProperty(shadowTarget, unwantedKey);
      }
      for (const discoveredKey of returnedKeys.difference(shadowKeys)) {
        Reflect.defineProperty(shadowTarget, discoveredKey, UpdateShadowTarget.#undefinedDescriptor);
      }
      */

      for (const key of shadowKeys) {
        if (returnedKeys.has(key))
          continue;
        Reflect.deleteProperty(shadowTarget, key);
      }
      for (const key of returnedKeys) {
        if (shadowKeys.has(key))
          continue;
        Reflect.defineProperty(shadowTarget, key, UpdateShadowTarget.#undefinedDescriptor);
      }

      return result;
    }

    public preventExtensions(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object
    ): boolean
    {
      if (Reflect.isExtensible(shadowTarget) === false) {
        return false;
      }

      const result = super.preventExtensions(shadowTarget, nextGraphKey, nextTarget);
      if (result) {
        this.#lockShadowTarget(shadowTarget, nextGraphKey, nextTarget);
      }
      return result;
    }

    #lockShadowTarget(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object
    ): void
    {
      const keys: (string | symbol)[] = this.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      keys.forEach(key => {
        // this will update the properties for us
        this.getOwnPropertyDescriptor(shadowTarget, key, nextGraphKey, nextTarget, key);
      });

      void(this.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget));

      Reflect.preventExtensions(shadowTarget);
    }
  }
  return UpdateShadowTarget;
}
UpdateShadowTarget satisfies ClassDecoratorFunction<
  typeof ObjectGraphTailHandler,
  true,
  false
>;
