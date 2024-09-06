import type { ClassDecoratorFunction } from "../../types/ClassDecoratorFunction.js";
import ObjectGraphTailHandler from "../ObjectGraphTailHandler.js";

export default function WrapReturnValues(
  baseClass: typeof ObjectGraphTailHandler,
  context: ClassDecoratorContext,
): typeof ObjectGraphTailHandler {
  class WrapReturnValues extends baseClass {
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
      const result: any = super.apply(
        shadowTarget,
        thisArg,
        argArray,
        nextGraphKey,
        nextTarget,
        nextThisArg,
        nextArgArray,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as any;
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
      const result: object = super.construct(
        shadowTarget,
        argArray,
        newTarget,
        nextGraphKey,
        nextTarget,
        nextArgArray,
        nextNewTarget,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as object;
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
      const result: boolean = super.defineProperty(
        shadowTarget,
        property,
        attributes,
        nextGraphKey,
        nextTarget,
        nextProperty,
        nextAttributes,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: boolean = super.deleteProperty(
        shadowTarget,
        p,
        nextGraphKey,
        nextTarget,
        nextP,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: any = super.get(
        shadowTarget,
        p,
        receiver,
        nextGraphKey,
        nextTarget,
        nextP,
        nextReceiver,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as any;
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
      const result: PropertyDescriptor | undefined =
        super.getOwnPropertyDescriptor(
          shadowTarget,
          p,
          nextGraphKey,
          nextTarget,
          nextP,
        );
      return this.thisGraphValues!.getDescriptorInGraph(
        result,
        this.thisGraphKey,
      );
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
      const result: object | null = super.getPrototypeOf(
        shadowTarget,
        nextGraphKey,
        nextTarget,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as object | null;
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
      const result: boolean = super.has(
        shadowTarget,
        p,
        nextGraphKey,
        nextTarget,
        nextP,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: boolean = super.isExtensible(
        shadowTarget,
        nextGraphKey,
        nextTarget,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: (string | symbol)[] = super.ownKeys(
        shadowTarget,
        nextGraphKey,
        nextTarget,
      );
      return this.thisGraphValues!.getArrayInGraph(
        result,
        this.thisGraphKey,
      ) as (string | symbol)[];
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
      const result: boolean = super.preventExtensions(
        shadowTarget,
        nextGraphKey,
        nextTarget,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: boolean = super.set(
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
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
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
      const result: boolean = super.setPrototypeOf(
        shadowTarget,
        v,
        nextGraphKey,
        nextTarget,
        nextV,
      );
      return this.thisGraphValues!.getValueInGraph(
        result,
        this.thisGraphKey,
      ) as boolean;
    }
  }

  return WrapReturnValues;
}

WrapReturnValues satisfies ClassDecoratorFunction<
  typeof ObjectGraphTailHandler,
  true,
  false
>;
