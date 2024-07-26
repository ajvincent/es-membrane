import AlwaysRevokedProxy from "../../AlwaysRevokedProxy.js";
import type { ClassDecoratorFunction } from "../../types/ClassDecoratorFunction.js";
import ObjectGraphTailHandler from "../ObjectGraphTailHandler.js";

export default function RevokedInFlight(
  baseClass: typeof ObjectGraphTailHandler,
  context: ClassDecoratorContext,
): typeof ObjectGraphTailHandler {
  class RevokedInFlight extends baseClass {
    /**
     * A trap method for a function call.
     * @param target The original callable object which is being proxied.
     */
    public apply(
      shadowTarget: object,
      thisArg: any,
      argArray: any[],
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextThisArg: any,
      nextArgArray: any[],
    ): any {
      try {
        return super.apply(
          shadowTarget,
          thisArg,
          argArray,
          nextGraphKey,
          nextTarget,
          nextThisArg,
          nextArgArray,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.apply(AlwaysRevokedProxy, thisArg, argArray);
      }
    }

    /**
     * A trap for the `new` operator.
     * @param target The original object which is being proxied.
     * @param newTarget The constructor that was originally called.
     */
    public construct(
      shadowTarget: object,
      argArray: any[],
      newTarget: Function,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextArgArray: any[],
      nextNewTarget: Function,
    ): object {
      try {
        return super.construct(
          shadowTarget,
          argArray,
          newTarget,
          nextGraphKey,
          nextTarget,
          nextArgArray,
          nextNewTarget,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.construct(AlwaysRevokedProxy, argArray, newTarget);
      }
    }

    /**
     * A trap for `Object.defineProperty()`.
     * @param target The original object which is being proxied.
     * @returns A `Boolean` indicating whether or not the property has been defined.
     */
    public defineProperty(
      shadowTarget: object,
      property: string | symbol,
      attributes: PropertyDescriptor,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextProperty: string | symbol,
      nextAttributes: PropertyDescriptor,
    ): boolean {
      try {
        return super.defineProperty(
          shadowTarget,
          property,
          attributes,
          nextGraphKey,
          nextTarget,
          nextProperty,
          nextAttributes,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.defineProperty(
            AlwaysRevokedProxy,
            property,
            attributes,
          );
      }
    }

    /**
     * A trap for the `delete` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to delete.
     * @returns A `Boolean` indicating whether or not the property was deleted.
     */
    public deleteProperty(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
    ): boolean {
      try {
        return super.deleteProperty(
          shadowTarget,
          p,
          nextGraphKey,
          nextTarget,
          nextP,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.deleteProperty(AlwaysRevokedProxy, p);
      }
    }

    /**
     * A trap for getting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to get.
     * @param receiver The proxy or an object that inherits from the proxy.
     */
    public get(
      shadowTarget: object,
      p: string | symbol,
      receiver: any,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
      nextReceiver: any,
    ): any {
      try {
        return super.get(
          shadowTarget,
          p,
          receiver,
          nextGraphKey,
          nextTarget,
          nextP,
          nextReceiver,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.get(AlwaysRevokedProxy, p, receiver);
      }
    }

    /**
     * A trap for `Object.getOwnPropertyDescriptor()`.
     * @param target The original object which is being proxied.
     * @param p The name of the property whose description should be retrieved.
     */
    public getOwnPropertyDescriptor(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
    ): PropertyDescriptor | undefined {
      try {
        return super.getOwnPropertyDescriptor(
          shadowTarget,
          p,
          nextGraphKey,
          nextTarget,
          nextP,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.getOwnPropertyDescriptor(AlwaysRevokedProxy, p);
      }
    }

    /**
     * A trap for the `[[GetPrototypeOf]]` internal method.
     * @param target The original object which is being proxied.
     */
    public getPrototypeOf(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object,
    ): object | null {
      try {
        return super.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget);
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.getPrototypeOf(AlwaysRevokedProxy);
      }
    }

    /**
     * A trap for the `in` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to check for existence.
     */
    public has(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
    ): boolean {
      try {
        return super.has(shadowTarget, p, nextGraphKey, nextTarget, nextP);
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.has(AlwaysRevokedProxy, p);
      }
    }

    /**
     * A trap for `Object.isExtensible()`.
     * @param target The original object which is being proxied.
     */
    public isExtensible(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object,
    ): boolean {
      try {
        return super.isExtensible(shadowTarget, nextGraphKey, nextTarget);
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.isExtensible(AlwaysRevokedProxy);
      }
    }

    /**
     * A trap for `Reflect.ownKeys()`.
     * @param target The original object which is being proxied.
     */
    public ownKeys(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object,
    ): (string | symbol)[] {
      try {
        return super.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.ownKeys(AlwaysRevokedProxy);
      }
    }

    /**
     * A trap for `Object.preventExtensions()`.
     * @param target The original object which is being proxied.
     */
    public preventExtensions(
      shadowTarget: object,
      nextGraphKey: string | symbol,
      nextTarget: object,
    ): boolean {
      try {
        return super.preventExtensions(shadowTarget, nextGraphKey, nextTarget);
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.preventExtensions(AlwaysRevokedProxy);
      }
    }

    /**
     * A trap for setting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to set.
     * @param receiver The object to which the assignment was originally directed.
     * @returns A `Boolean` indicating whether or not the property was set.
     */
    public set(
      shadowTarget: object,
      p: string | symbol,
      newValue: any,
      receiver: any,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
      nextNewValue: any,
      nextReceiver: any,
    ): boolean {
      try {
        return super.set(
          shadowTarget,
          p,
          newValue,
          receiver,
          nextGraphKey,
          nextTarget,
          nextP,
          nextNewValue,
          nextReceiver,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.set(AlwaysRevokedProxy, p, newValue, receiver);
      }
    }

    /**
     * A trap for `Object.setPrototypeOf()`.
     * @param target The original object which is being proxied.
     * @param newPrototype The object's new prototype or `null`.
     */
    public setPrototypeOf(
      shadowTarget: object,
      v: object | null,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextV: object | null,
    ): boolean {
      try {
        return super.setPrototypeOf(
          shadowTarget,
          v,
          nextGraphKey,
          nextTarget,
          nextV,
        );
      } finally {
        if (this.thisGraphValues!.isRevoked)
          return Reflect.setPrototypeOf(AlwaysRevokedProxy, v);
      }
    }
  }

  return RevokedInFlight;
}

RevokedInFlight satisfies ClassDecoratorFunction<
  typeof ObjectGraphTailHandler,
  true,
  false
>;
