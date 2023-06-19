import type {
  ClassMethodDecorator,
  ClassMethodDecoratorReturn
} from "../../source/types/ClassMethodDecorator.mjs";

import NumberStringClass from "../../fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.mjs";

describe("ClassMethodDecorator is compatible with ECMAScript decorators", () => {
  it("returning void", () => {
    let noArgsCalled = false;
    let withArgsCalled = false;

    function forward(
      method: NumberStringType["repeatForward"],
      context: ClassMethodDecoratorContext<NumberStringType, NumberStringType["repeatForward"]>
    ): void
    {
      void(method);
      void(context);
      noArgsCalled = true;
    }
    {
      // type-checking test
      const foo: ClassMethodDecorator<NumberStringType, "repeatForward", false, false> = forward;
      void(foo);
    }

    function back(
      higherScopeBoolean: boolean,
    ): ClassMethodDecorator<NumberStringType, "repeatBack", false, false>
    {
      return function(method, context): void {
        void(method);
        void(context);
        withArgsCalled = higherScopeBoolean;
      }
    }
    {
      // type-checking test
      const foo: ClassMethodDecorator<
        NumberStringType,
        "repeatBack",
        false,
        [boolean]
      > = back;
      void(foo);
    }

    class NST extends NumberStringClass {
      @forward
      repeatForward(s: string, n: number): string {
        return super.repeatForward(s, n);
      }

      @back(true)
      repeatBack(n: number, s: string): string {
        return super.repeatBack(n, s);
      }
    }

    expect<boolean>(noArgsCalled).toBe(true);
    expect<boolean>(withArgsCalled).toBe(true);

    const nst = new NST;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");
  });

  it("returning a replacement method", () => {
    function forward(
      method: NumberStringType["repeatForward"],
      context: ClassMethodDecoratorContext<NumberStringType, NumberStringType["repeatForward"]>
    ): ClassMethodDecoratorReturn<NumberStringType, "repeatForward">
    {
      void(context);
      return function(s: string, n: number): string {
        return method(s, n + 1);
      }
    }
    {
      // type-checking test
      const foo: ClassMethodDecorator<NumberStringType, "repeatForward", true, false> = forward;
      void(foo);
    }

    function back(
      offset: number
    ): ClassMethodDecorator<NumberStringType, "repeatBack", true, false>
    {
      return function(method, context): ClassMethodDecoratorReturn<NumberStringType, "repeatBack"> {
        void(context);
        return function(n: number, s: string): string {
          return method(n + offset, s);
        }
      }
    }
    {
      // type-checking test
      const foo: ClassMethodDecorator<
        NumberStringType,
        "repeatBack",
        true,
        [number]
      > = back;
      void(foo);
    }

    class NST extends NumberStringClass {
      @forward
      repeatForward(s: string, n: number): string {
        return super.repeatForward(s, n);
      }

      @back(1)
      repeatBack(n: number, s: string): string {
        return super.repeatBack(n, s);
      }
    }

    const nst = new NST;
    expect<string>(nst.repeatForward("foo", 2)).toBe("foofoofoo");
    expect<string>(nst.repeatBack(2, "foo")).toBe("foofoofoo");
  });
});
