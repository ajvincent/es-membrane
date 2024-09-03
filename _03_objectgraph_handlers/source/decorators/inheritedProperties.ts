import graphAssert from "../exceptions/graphAssert.js";

import ObjectGraphTailHandler from "../generated/ObjectGraphTailHandler.js";

import {
  DataDescriptor,
  isAccessorDescriptor,
  isDataDescriptor,
  valueType,
} from "../sharedUtilities.js";

export default function InheritedPropertyTraps(
  baseClass: typeof ObjectGraphTailHandler,
  context: ClassDecoratorContext
): typeof ObjectGraphTailHandler
{
  void(context);
  class InheritedPropertyTraps extends baseClass
  {
    // https://262.ecma-international.org/#sec-ordinaryget
    public get(
      shadowTarget: object,
      p: string | symbol,
      receiver: any,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
      nextReceiver: any,
    ): any
    {
      let desc: PropertyDescriptor | undefined = this.#getMatchingDescriptorDeep(
        shadowTarget, p, nextGraphKey, nextTarget, nextP
      );
      if (desc === undefined)
        return undefined;

      if (isDataDescriptor(desc))
        return desc.value;

      graphAssert(
        isAccessorDescriptor(desc),
        "desc must be an accessor descriptor or a data descriptor",
        this.membrane,
        this.thisGraphKey
      );

      if (desc.get === undefined)
        return undefined;

      const wrappedGet = this.membrane.convertDescriptor(nextGraphKey, desc)?.get;
      graphAssert(typeof wrappedGet === "function", "must have a wrapped getter", this.membrane, this.thisGraphKey);

      return super.apply(
        desc.get, receiver, [], nextGraphKey, wrappedGet as () => any, nextReceiver, []
      );
    }

    // https://262.ecma-international.org/#sec-ordinaryhasproperty
    public has(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
    ): boolean
    {
      return Boolean(this.#getMatchingDescriptorDeep(
        shadowTarget, p, nextGraphKey, nextTarget, nextP
      ));
    }

    // https://262.ecma-international.org/#sec-ordinarysetwithowndescriptor
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
    ): boolean
    {
      let ownDesc: PropertyDescriptor | undefined = this.#getMatchingDescriptorDeep(
        shadowTarget, p, nextGraphKey, nextTarget, nextP
      );

      ownDesc ||= new DataDescriptor(undefined, true, true, true);

      if (isDataDescriptor(ownDesc)) {
        if (ownDesc.writable === false)
          return false;

        if (valueType(receiver) === "primitive")
          return false;

        const existingDescriptor: PropertyDescriptor | undefined = super.getOwnPropertyDescriptor(
          receiver, p, nextGraphKey, nextReceiver, nextP
        );

        if (existingDescriptor) {
          if (isAccessorDescriptor(existingDescriptor))
            return false;
          if (existingDescriptor.writable === false)
            return false;

          const valueDesc = { value: newValue };

          graphAssert(
            this.thisGraphValues!.isKnownProxy(receiver),
            "expected a proxy receiver",
            this.membrane,
            this.thisGraphKey
          );
          return Reflect.defineProperty(receiver, p, valueDesc);
        }

        // "Assert: Receiver does not currently have a property P."
        //XXX: unclear if we want this.has, super.has or Reflect.has
        /* commented out for now, under the presumption we're stable
        graphAssert(
          Reflect.has(receiver, p) === false,
          "receiver must not have the property " + String(p),
          this.membrane,
          this.thisGraphKey
        );
        */

        // CreateDataProperty
        let newDesc = new DataDescriptor(newValue, true, true, true);

        graphAssert(
          this.thisGraphValues!.isKnownProxy(receiver),
          "expected a proxy receiver",
          this.membrane,
          this.thisGraphKey
        );
        return Reflect.defineProperty(receiver, p, newDesc);
      }

      graphAssert(
        isAccessorDescriptor(ownDesc),
        "ownDesc must be an accessor descriptor or a data descriptor",
        this.membrane,
        this.thisGraphKey
      );

      const setter = ownDesc.set;
      if (setter === undefined)
        return false;

      const wrappedSet = this.membrane.convertDescriptor(nextGraphKey, ownDesc)?.set;
      graphAssert(typeof wrappedSet === "function", "must have a wrapped getter", this.membrane, this.thisGraphKey);

      const valueArgs = [newValue];
      const wrappedValueArgs = this.membrane.convertArray(nextGraphKey, valueArgs);

      super.apply(
        setter, receiver, valueArgs, nextGraphKey, wrappedSet!, nextReceiver, wrappedValueArgs
      );
      return true;
    }

    #getMatchingDescriptorDeep(
      shadowTarget: object,
      p: string | symbol,
      nextGraphKey: string | symbol,
      nextTarget: object,
      nextP: string | symbol,
    ): PropertyDescriptor | undefined
    {
      do {
        let desc = super.getOwnPropertyDescriptor(shadowTarget, p, nextGraphKey, nextTarget, nextP);
        if (desc)
          return desc;

        let protoShadowTarget = super.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget);
        let protoNextTarget = Reflect.getPrototypeOf(nextTarget);
        if (!protoNextTarget || !protoShadowTarget)
          break;

        shadowTarget = protoShadowTarget;
        nextTarget = protoNextTarget;
      } while (shadowTarget);

      return undefined;
    }
  }

  return InheritedPropertyTraps;
}
