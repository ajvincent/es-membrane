import type {
  Class,
} from "type-fest";

/**
 * A class decorator which does returns a class to replace the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @typeParam ReturnsModified - the modified class type, true for returning the base class, or false for returning void.
 * @typeParam Arguments - require arguments to execute the decorator.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
type ClassDecoratorFunction<
  BaseClassType extends Class<object>,
  ReturnsModified extends boolean | BaseClassType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[] | false
> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[] ?
  (...args: Arguments) => ClassDecoratorFunction<BaseClassType, ReturnsModified, false> :
  (
    baseClass: BaseClassType,
    context: ClassDecoratorContext,
  ) => (
    ReturnsModified extends BaseClassType ? ReturnsModified :
    true extends ReturnsModified ? BaseClassType :
    void
  )
);

interface ClassEvent {
  eventType: "decoratorApplied" | "initializerCallback" | "construction";
  item: "A" | "B" | "C";
  decoratorItems?: ClassEvent["item"][];
}

const events: ClassEvent[] = [];
const decoratorItems: ClassEvent["item"][] = [];

const logEvent: ClassDecoratorFunction<Class<object>, true, [ClassEvent["item"]]> = function(
  item: ClassEvent["item"]
): ClassDecoratorFunction<Class<object>, true, false>
{
  return function(
    baseClass: Class<object>,
    context: ClassDecoratorContext
  ): Class<object>
  {
    class extendedClass extends baseClass {
      constructor() {
        super();
        events.push({
          eventType: "construction",
          item,
        });

        Reflect.defineProperty(this, item, {value: true});
      }
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
    return extendedClass;
  }
}

@logEvent("A")
@logEvent("B")
class DecoratedClass {
  constructor() {
    events.push({
      eventType: "construction",
      item: "C"
    });

    Reflect.defineProperty(this, "C", {value: true});
  }
}

const instance = new DecoratedClass;
void(instance);
