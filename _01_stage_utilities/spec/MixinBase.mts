import MixinBase from "../source/MixinBase.mjs";
import type {
  MergeClass
} from "../source/MergeClass.mjs";

import type {
  StaticFoo,
  hasZ
} from "../fixtures/DecoratedClass/DerivedInterfaces.mjs";
import type {
  Class
} from "type-fest";

interface MiddleInterfaceStatic {
  middle: string;
}
interface MiddleInterface {
  isMiddle: boolean;
}

describe("MixinBase can create subclasses as mix-ins", () => {
  it("directly, without types being passed in as a class", () => {
    function buildDerived(
      staticFoo: string,
      startingZ: number
    ) : MergeClass<StaticFoo, hasZ, typeof MixinBase, object>
    {
      return class extends MixinBase {
        static readonly foo = staticFoo;
        z = startingZ;
      }
    }

    const DerivedClass = buildDerived("foo", 12);
    expect(Reflect.ownKeys(DerivedClass)).toEqual(["length", "name", "prototype", "foo"]);
    expect(DerivedClass.foo).toBe("foo");

    const derivedInstance = new DerivedClass();
    expect(Reflect.ownKeys(derivedInstance)).toEqual(["requiredInitializers", "z"]);
    expect(derivedInstance.z).toBe(12);
  });

  it("with the base class passed in but without type parameters on the builder", () => {
    function buildDerived
    (
      baseClass: typeof MixinBase,
      staticFoo: string,
      startingZ: number
    ) : MergeClass<StaticFoo, hasZ, typeof MixinBase, object>
    {
      class DerivedClass extends baseClass
      {
        static readonly foo = staticFoo;
        z = startingZ;
      }
      return DerivedClass;
    }

    {
      const DerivedClassOne = buildDerived(MixinBase, "foo", 12);
      expect(Reflect.ownKeys(DerivedClassOne)).toEqual(["length", "name", "prototype", "foo"]);
      expect(DerivedClassOne.foo).toBe("foo");

      const derivedInstance = new DerivedClassOne();
      expect(Reflect.ownKeys(derivedInstance)).toEqual(["requiredInitializers", "z"]);
      expect(derivedInstance.z).toBe(12);
    }

    // with a middle class involved
    {
      class MiddleClass extends MixinBase implements MiddleInterface {
        static readonly middle = "middle";
        isMiddle = true;
      }
      void(MiddleClass as MiddleInterfaceStatic & typeof MixinBase);

      // this is a lengthy definition, but it illustrates the need for the MergeClass type
      const DerivedClassTwo = buildDerived(MiddleClass, "bar", 8) as (
        // static
        typeof MixinBase & MiddleInterfaceStatic & StaticFoo &

        // prototype, constructor
        Class<MixinBase & MiddleInterface & hasZ, ConstructorParameters<typeof MiddleClass>>
      );

      expect(Reflect.ownKeys(DerivedClassTwo)).toEqual(["length", "name", "prototype", "foo"]);

      expect(DerivedClassTwo.foo).toBe("bar");
      expect(DerivedClassTwo.middle).toBe("middle");

      // type annotation needed here
      const derivedInstance = new DerivedClassTwo() as hasZ & MiddleInterface & MixinBase;

      expect(Reflect.ownKeys(derivedInstance)).toEqual(["requiredInitializers", "isMiddle", "z"]);
      expect(derivedInstance.z).toBe(8);
      expect(derivedInstance.isMiddle).toBe(true);
    }
  });

  it("with the base class passed in and with a type parameter on the builder referencing the base class type", () => {
    function buildDerived
    <
      // This type parameter is why MixinBase needs its constructor, and why nothing in the subclass chain can have its own constructor.
      BaseClass extends typeof MixinBase
    >
    (
      baseClass: BaseClass,
      staticFoo: string,
      startingZ: number
    ) : MergeClass<StaticFoo, hasZ, BaseClass, object>
    {
      class DerivedClass extends baseClass
      {
        static readonly foo = staticFoo;
        z = startingZ;
      }
      return DerivedClass;
    }

    {
      const DerivedClassOne = buildDerived<typeof MixinBase>(MixinBase, "foo", 12);
      expect(Reflect.ownKeys(DerivedClassOne)).toEqual(["length", "name", "prototype", "foo"]);
      expect(DerivedClassOne.foo).toBe("foo");

      const derivedInstance = new DerivedClassOne();
      expect(Reflect.ownKeys(derivedInstance)).toEqual(["requiredInitializers", "z"]);
      expect(derivedInstance.z).toBe(12);
    }

    {
      class MiddleClass extends MixinBase implements MiddleInterface {
        static readonly middle = "middle";
        isMiddle = true;
      }
      void(MiddleClass as MiddleInterfaceStatic & typeof MixinBase);

      const DerivedClassTwo = buildDerived<typeof MiddleClass>(MiddleClass, "bar", 8);

      expect(Reflect.ownKeys(DerivedClassTwo)).toEqual(["length", "name", "prototype", "foo"]);

      expect(DerivedClassTwo.foo).toBe("bar");
      expect(DerivedClassTwo.middle).toBe("middle");

      // type annotation needed here
      const derivedInstance = new DerivedClassTwo() as hasZ & MiddleInterface & MixinBase;

      expect(Reflect.ownKeys(derivedInstance)).toEqual(["requiredInitializers", "isMiddle", "z"]);
      expect(derivedInstance.z).toBe(8);
      expect(derivedInstance.isMiddle).toBe(true);
    }
  });
});
