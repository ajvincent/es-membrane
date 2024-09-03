import type {
  ClassDecoratorFunction
} from "../types/ClassDecoratorFunction.js";

import ObjectGraphTailHandler from "../generated/ObjectGraphTailHandler.js";

export default function UpdateShadowTarget(
  baseClass: typeof ObjectGraphTailHandler,
  context: ClassDecoratorContext
): typeof ObjectGraphTailHandler
{
  void(context);
  class UpdateShadowTarget extends baseClass
  {
    static #undefinedDescriptor = Object.freeze({
      value: undefined,
      writable: true,
      enumerable: false,
      configurable: true,
    });

    // apply and construct traps do not need to modify the shadow target.

    public defineProperty(
      shadowTarget: object,
      property: string | symbol,
      attributes: PropertyDescriptor,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextProperty: string | symbol,
      nextAttributes: PropertyDescriptor
    ): boolean
    {
      let result: boolean = super.defineProperty(
        shadowTarget, property, attributes, nextGraphKey, nextTarget, nextProperty, nextAttributes
      );
      if (result)
        result = Reflect.defineProperty(shadowTarget, property, attributes);
      return result;
    }

    public deleteProperty(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol
    ): boolean
    {
      let result: boolean = super.deleteProperty(
        shadowTarget, p, nextGraphKey, nextTarget, nextP
      );
      if (result)
        result = Reflect.deleteProperty(shadowTarget, p);
      return result;
    }

    // get is a recursive operation, per https://262.ecma-international.org/#sec-ordinaryget

    public getOwnPropertyDescriptor(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol
    ): PropertyDescriptor | undefined
    {
      // The theory here is "trust the JavaScript engine to do the right thing".
      const desc = super.getOwnPropertyDescriptor(shadowTarget, p, nextGraphKey, nextTarget, nextP);
      if (desc)
        Reflect.defineProperty(shadowTarget, p, desc);
      else
        Reflect.deleteProperty(shadowTarget, p);

      return Reflect.getOwnPropertyDescriptor(shadowTarget, p);
    }

    public getPrototypeOf(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object
    ): object | null
    {
      const proto = super.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget);
      Reflect.setPrototypeOf(shadowTarget, proto);
      return Reflect.getPrototypeOf(shadowTarget);
    }

    // has is a recursive operation, per https://262.ecma-international.org/#sec-ordinaryhasproperty

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
      if (result)
        this.#lockShadowTarget(shadowTarget, nextGraphKey, nextTarget);

      return result;
    }

    // set is a recursive operation, and thus covered elsewhere

    public setPrototypeOf(
      shadowTarget: object,
      v: object | null,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextV: object | null
    ): boolean
    {
      let result: boolean = super.setPrototypeOf(
        shadowTarget, v, nextGraphKey, nextTarget, nextV
      );
      if (result)
        result = Reflect.setPrototypeOf(shadowTarget, v);
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
