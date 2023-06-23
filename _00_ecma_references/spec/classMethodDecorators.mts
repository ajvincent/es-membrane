/* eslint-disable @typescript-eslint/no-explicit-any */
type ClassMethodDecoratorReturn<
  This extends object,
  Key extends keyof This,
> =
  This[Key] extends (...args: any[]) => any ?
  (
    this: This,
    ...args: Parameters<This[Key]>
  ) => ReturnType<This[Key]> :
  never;

type ClassMethodDecorator<
  This extends object,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = This[Key] extends (...args: any[]) => any ?
  (
    Arguments extends any[] ?
    (...args: Arguments) => ClassMethodDecorator<This, Key, ReturnsModified, false> :

    (
      this: void,
      method: This[Key],
      context: ClassMethodDecoratorContext<This, This[Key]>
    ) => (
      true extends ReturnsModified ? ClassMethodDecoratorReturn<This, Key> :
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
    ): ClassMethodDecoratorReturn<FooInstance, "foo">
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
