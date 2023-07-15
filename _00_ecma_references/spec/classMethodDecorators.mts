/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "../fixtures/NumberStringClass.mjs";


type ClassMethodDecorator<
  This extends object,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = This[Key] extends (this: This, ...args: any[]) => any ?
  (
    Arguments extends any[] ?
    (...args: Arguments) => ClassMethodDecorator<This, Key, ReturnsModified, false> :

    (
      this: void,
      method: This[Key],
      context: ClassMethodDecoratorContext<This, This[Key]>
    ) => (
      true extends ReturnsModified ? This[Key] :
      void
    )
  ) :

  never
;

type MethodEvent = {
  eventType: "decoratorApplied" | "initializerCallback" | "invocation",
  item: "A" | "B" | "C";
  decoratorItems?: MethodEvent["item"][];
}

it("Method decorators apply from bottom to top, so the returned method runs from top to bottom", () => {
  const events: MethodEvent[] = [];
  const decoratorItems: MethodEvent["item"][] = [];

  type FooInstance = {
    foo(): void;
  }

  const logEvent: ClassMethodDecorator<FooInstance, "foo", true, [MethodEvent["item"]]> = function(
    item: MethodEvent["item"]
  ): ClassMethodDecorator<FooInstance, "foo", true, false>
  {
    return function(
      this: void,
      method: FooInstance["foo"],
      context: ClassMethodDecoratorContext<FooInstance, FooInstance["foo"]>,
    ): FooInstance["foo"]
    {
      const override = function(
        this: FooInstance,
        ...args: Parameters<FooInstance["foo"]>
      ): ReturnType<FooInstance["foo"]>
      {
        events.push({
          eventType: "invocation",
          item,
        });

        return method.apply(this, ...args);
      }

      context.addInitializer(() => {
        events.push({
          eventType: "initializerCallback",
          item,

          decoratorItems: decoratorItems.slice(),
        });
      });

      events.push({
        eventType: "decoratorApplied",
        item,
      });

      decoratorItems.push(item);
      return override;
    }
  }

  class DecoratedClass implements FooInstance {
    @logEvent("A")
    @logEvent("B")
    foo(): void {
      events.push({
        eventType: "invocation",
        item: "C"
      });
    }
  }

  const X = new DecoratedClass;
  X.foo();

  expect(events).toEqual([
    {
      eventType: "decoratorApplied",
      item: "B",
    },

    {
      eventType: "decoratorApplied",
      item: "A",
    },

    {
      eventType: "initializerCallback",
      item: "B",
      decoratorItems: ["B", "A"],
    },

    {
      eventType: "initializerCallback",
      item: "A",
      decoratorItems: ["B", "A"],
    },

    {
      eventType: "invocation",
      item: "A",
    },

    {
      eventType: "invocation",
      item: "B",
    },

    {
      eventType: "invocation",
      item: "C",
    },
  ])
});

it("Generic method decorators are possible", () => {
  const events: [object, string | number | symbol, ...unknown[]][] = [];

  function spyDecoratorBase<
    This extends Record<
      string | number | symbol,
      (this: This, ...args: any[]) => any
    >,
    Key extends keyof This
  >
  (
    this: This,
    key: Key,
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>,
  ): This[Key]
  {
    void(context);
  
    const rv: This[Key] = function(
      this: This,
      ...parameters: Parameters<This[Key]>
    ): ReturnType<This[Key]>
    {
      events.push([this, key, ...parameters]);
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return method.apply/*<This, typeof parameters, ReturnType<This[Key]>>*/(
        this, parameters
      );
    } as This[Key];
  
    return rv;
  }
  
  function spyDecorator<
    This extends Record<
      string | number | symbol,
      (this: This, ...args: any[]) => any
    >,
    Key extends keyof This,
  >
  (
    key: Key
  ):
    (
      method: This[Key],
      context: ClassMethodDecoratorContext<This, This[Key]>
    ) => This[Key]
  {
    return function(
      this: This, method, context
    )
    {
      return (spyDecoratorBase<This, Key>).apply(this, [key, method, context]);
    }
  }
  
  spyDecorator satisfies ClassMethodDecorator<
    NumberStringType,
    keyof NumberStringType,
    true,
    [keyof NumberStringType]
  >;
  
  class NST_Generic extends NumberStringClass {
    @spyDecorator<NumberStringType, "repeatForward">("repeatForward")
    repeatForward(
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): ReturnType<NumberStringType["repeatForward"]>
    {
      return super.repeatForward(...parameters);
    }
  
    @spyDecorator<NumberStringType, "repeatBack">("repeatBack")
    repeatBack(
      ...parameters: Parameters<NumberStringType["repeatBack"]>
    ): ReturnType<NumberStringType["repeatBack"]>
    {
      return super.repeatBack(...parameters);
    }
  }
  
  {
    const A = new NST_Generic;
    expect<string>(A.repeatForward("foo", 3)).toBe("foofoofoo");
    expect(events).toEqual([
      [A, "repeatForward", "foo", 3]
    ]);
  }
});
