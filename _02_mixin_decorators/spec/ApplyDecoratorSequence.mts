import type {
  Class
} from "../source/types/Class.mjs";

import type {
  ClassDecoratorFunction
} from "../source/types/ClassDecoratorFunction.mjs";

import DecoratorSequence from "../source/ApplyDecoratorSequence.mjs";

describe("DecoratorSequence", () => {
  it(".classes works", () => {

    const logger: ClassDecoratorFunction<Class<object, []>, false, [string, string[]]> = function(
      nextToAdd: string,
      stringArray: string[]
    ): ClassDecoratorFunction<Class<object, []>, false, false> {
      return function(
        baseClass: Class<object, []>,
        context: ClassDecoratorContext<Class<object, []>>
      ): void {
        stringArray.push(nextToAdd)
        void(baseClass);
        void(context);
      }
    }

    const expectedArray: string[] = [];

    @logger("A", expectedArray)
    @logger("B", expectedArray)
    class DecoratedClass {}
    void(DecoratedClass);
    expect(expectedArray.length).toBe(2);

    const actualArray: string[] = [];
    const decoratorA = logger("A", actualArray);
    const decoratorB = logger("B", actualArray);

    expect(actualArray.length).toBe(0);

    DecoratorSequence.classes([decoratorA, decoratorB], class {});

    expect(actualArray).toEqual(expectedArray);
  });
});
