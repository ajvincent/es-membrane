import type {
  Class
} from "type-fest";

import type {
  ClassDecoratorFunction
} from "../../source/types/ClassDecoratorFunction.js";

import NumberStringClass from "../../fixtures/NumberStringClass.js"
import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.js";

type WithCounter = {
  counter: number | boolean;
};

describe("Mixin class types: ClassDecoratorFunction", () => {
  describe("with no constructor arguments specified and", () => {
    it("and no modifications to the class", () => {
      let _class: typeof NumberStringClass | undefined;

      const NST_Decorator: ClassDecoratorFunction<
        typeof NumberStringClass, false, false
      > = function(baseClass, context): void
      {
        _class = baseClass;
        void(context);
      }

      @NST_Decorator
      class Foo extends NumberStringClass {
      }

      expect(_class).toBe(Foo);
    });

    it("and a replacement class extending the original, but not stating so", () => {
      const NST_Decorator: ClassDecoratorFunction<
        typeof NumberStringClass, true, false
      > = function(baseClass, context): typeof NumberStringClass
      {
        void(context);
        return class extends baseClass implements WithCounter {
          counter: number | boolean = 120;
        }
      }

      @NST_Decorator
      class Foo extends NumberStringClass {
      }

      const FooInstance = new Foo;
      expect(FooInstance.repeatBack(3, "foo")).toBe("foofoofoo");
      expect(Reflect.ownKeys(FooInstance)).toEqual(["counter"]);
      // @ts-expect-error the decorator never reported the new field
      expect(FooInstance.counter).toBe(120);
    });

    it("and a replacement class extending the original, while stating so", () => {
      const NST_Decorator: ClassDecoratorFunction<
        typeof NumberStringClass, Class<WithCounter & NumberStringType>, false
      > = function(baseClass, context): Class<WithCounter & NumberStringType>
      {
        void(context);
        return class extends baseClass implements WithCounter {
          counter: number | boolean = false;
        }
      }

      @NST_Decorator
      class Foo extends NumberStringClass {
      }

      const FooInstance = new Foo;
      expect(FooInstance.repeatBack(3, "foo")).toBe("foofoofoo");
      expect(Reflect.ownKeys(FooInstance)).toEqual(["counter"]);
      // @ts-expect-error the decorator reports the new field, but TypeScript doesn't forward it.
      expect(FooInstance.counter).toBe(false);
    });

    it("and with decorator arguments", () => {
      const NST_Decorator: ClassDecoratorFunction<
        typeof NumberStringClass, true, [number | boolean]
      > = function (counter: number | boolean)
      {
        return function(baseClass, context): typeof NumberStringClass
        {
          void(context);
          return class extends baseClass implements WithCounter {
            counter = counter;
          }
        }
      }

      @NST_Decorator(-147)
      class Foo extends NumberStringClass {
      }

      const FooInstance = new Foo;
      expect(FooInstance.repeatBack(3, "foo")).toBe("foofoofoo");
      expect(Reflect.ownKeys(FooInstance)).toEqual(["counter"]);
      // @ts-expect-error the decorator never reported the new field
      expect(FooInstance.counter).toBe(-147);
    });
  });

  it("with rest-any parameters on the constructor", () => {
    let _class: typeof NumberStringClass | undefined;

    const NST_Decorator: ClassDecoratorFunction<
      typeof NumberStringClass, false, false
    > = function(baseClass, context): void
    {
      _class = baseClass;
      void(context);
    }

    @NST_Decorator
    class Foo extends NumberStringClass {
      constructor(...args: unknown[]) {
        super(...args);
      }
    }

    expect(_class).toBe(Foo);
  });

  it("with specific parameters on the constructor, that must match throughout", () => {
    type Invocations = {
      invocations: number;
    }

    class NumberStringClassWithCtor extends NumberStringClass implements Invocations
    {
      invocations: number;
      constructor(invocations: number) {
        super();
        this.invocations = invocations;
      }
    }

    const NST_Decorator: ClassDecoratorFunction<
      Class<NumberStringType & Invocations, [number]>,
      Class<WithCounter & NumberStringType & Invocations, [number]>,
      false
    > = function(baseClass, context): Class<WithCounter & NumberStringType & Invocations, [number]>
    {
      void(context);
      return class extends baseClass {
        counter: number | boolean = false;
        constructor(counter: number) {
          super(counter);
          this.counter = counter;
        }
      }
    }

    @NST_Decorator
    class Foo extends NumberStringClassWithCtor {
      constructor(counter: number) {
        super(counter);
      }
    }

    const x = new Foo(18);
    expect((x as unknown as WithCounter).counter).toBe(18);
  });
});
