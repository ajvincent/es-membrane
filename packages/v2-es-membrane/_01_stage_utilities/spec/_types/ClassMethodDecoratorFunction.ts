import type {
  ClassMethodDecoratorFunction
} from "../../source/types/ClassMethodDecoratorFunction.js";

import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.js";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.js";

describe("ClassMethodDecoratorFunction is compatible with ECMAScript decorators", () => {
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
    forward satisfies ClassMethodDecoratorFunction<NumberStringType, "repeatForward", false, false>;

    function back(
      higherScopeBoolean: boolean,
    ): ClassMethodDecoratorFunction<NumberStringType, "repeatBack", false, false>
    {
      return function(method, context): void {
        void(method);
        void(context);
        withArgsCalled = higherScopeBoolean;
      }
    }
    back satisfies ClassMethodDecoratorFunction<NumberStringType, "repeatBack", false, [boolean]>;

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
    ): NumberStringType["repeatForward"]
    {
      void(context);
      return function(s: string, n: number): string {
        return method(s, n + 1);
      }
    }
    forward satisfies ClassMethodDecoratorFunction<NumberStringType, "repeatForward", true, false>;

    function back(
      offset: number
    ): ClassMethodDecoratorFunction<NumberStringType, "repeatBack", true, false>
    {
      return function(method, context): NumberStringType["repeatBack"] {
        void(context);
        return function(n: number, s: string): string {
          return method(n + offset, s);
        }
      }
    }
    back satisfies ClassMethodDecoratorFunction<NumberStringType, "repeatBack", true, [number]>;

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
