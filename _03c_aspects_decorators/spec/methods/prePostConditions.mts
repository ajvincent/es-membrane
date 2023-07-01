import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NST_Aspects from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

import type {
  PreconditionContext,
  PostconditionContext,
  PreconditionWithContext,
  PostconditionWithContext,
  PreconditionWithoutContext,
  PostconditionWithoutContext,
} from "#aspects/decorators/source/types/PrePostConditionsContext.mjs";

describe("Preconditions and postconditions:", () => {
  it("a pair can work with a context argument", () => {
    const { prePostCondition } = NST_Aspects;

    let contextPassedThrough = false;

    function forwardPrecondition(
      this: NumberStringType,
      contextSetter: PreconditionContext<boolean>,
      s: string,
      n: number,
    ): void {
      if (n < 0) {
        throw new Error("precondition error");
      }
      void(s);
      contextSetter.set(true);
    }
    forwardPrecondition satisfies PreconditionWithContext<NumberStringType, "repeatForward", boolean>;

    function forwardPostcondition(
      this: NumberStringType,
      contextGetter: PostconditionContext<boolean>,
      returnValue: ReturnType<NumberStringType["repeatForward"]>,
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): void
    {
      void(parameters);
      contextPassedThrough = contextGetter.get();
      if (returnValue === "")
        throw new Error("postcondition error");
    }
    forwardPostcondition satisfies PostconditionWithContext<NumberStringType, "repeatForward", boolean>;

    function emptyPrecondition(
      contextSetter: PreconditionContext<never>,
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): void
    {
      void(contextSetter);
      void(parameters);
    }

    function emptyPostcondition(
      contextSetter: PostconditionContext<never>,
      returnValue: ReturnType<NumberStringType["repeatForward"]>,
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): void
    {
      void(contextSetter);
      void(returnValue);
      void(parameters);
    }

    class NST_Class extends NumberStringClass {
      @prePostCondition<"repeatForward", boolean>(forwardPrecondition, forwardPostcondition)
      @prePostCondition<"repeatForward", never>(emptyPrecondition, emptyPostcondition)
      repeatForward(s: string, n: number): string {
        return super.repeatForward(s, n);
      }
    }

    expect<boolean>(contextPassedThrough).toBe(false);

    const nst = new NST_Class;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    expect<boolean>(contextPassedThrough).toBe(true);

    contextPassedThrough = false;
    expect(
      () => nst.repeatForward("foo", -1)
    ).toThrowError("precondition error");
    expect<boolean>(contextPassedThrough).toBe(false);

    expect(
      () => nst.repeatForward("foo", 0)
    ).toThrowError("postcondition error");
    expect<boolean>(contextPassedThrough).toBe(true);
  });

  it("a standalone precondition works", () => {
    const { preCondition } = NST_Aspects;

    function forwardPrecondition(
      this: NumberStringType,
      s: string,
      n: number,
    ): void {
      if (n < 0) {
        throw new Error("precondition error");
      }
      void(s);
    }
    forwardPrecondition satisfies PreconditionWithoutContext<NumberStringType, "repeatForward">;

    class NST_Class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPrecondition)
      repeatForward(s: string, n: number): string {
        return super.repeatForward(s, n);
      }
    }

    const nst = new NST_Class;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    expect(
      () => nst.repeatForward("foo", -1)
    ).toThrowError("precondition error");
  });

  it("a standalone postcondition works", () => {
    const { postCondition } = NST_Aspects;

    function forwardPostcondition(
      this: NumberStringType,
      returnValue: ReturnType<NumberStringType["repeatForward"]>,
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): void
    {
      void(parameters);
      if (returnValue === "")
        throw new Error("postcondition error");
    }
    forwardPostcondition satisfies PostconditionWithoutContext<NumberStringType, "repeatForward">;

    class NST_Class extends NumberStringClass {
      @postCondition<"repeatForward">(forwardPostcondition)
      repeatForward(s: string, n: number): string {
        return super.repeatForward(s, n);
      }
    }

    const nst = new NST_Class;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    expect(
      () => nst.repeatForward("foo", 0)
    ).toThrowError("postcondition error");
  });
});
