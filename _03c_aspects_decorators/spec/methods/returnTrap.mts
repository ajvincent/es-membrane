import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import {
  RETURN_NOT_REPLACED
} from "#aspects/decorators/source/symbol-keys.mjs";

import NST_Aspects from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

it("returnTrap decorator lets us assert certain return values", () => {
  const { returnTrap } = NST_Aspects;

  const forwardSpy = jasmine.createSpy();

  function returnForwardSpy(
    this: NumberStringType,
    context: object,
    __rv__: string,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): typeof RETURN_NOT_REPLACED
  {
    void(context);
    forwardSpy(this, __rv__, ...parameters);
    if (__rv__ === "")
      throw new Error("result is empty");
    return RETURN_NOT_REPLACED;
  }

  class NST_Class extends NumberStringClass {
    @returnTrap<"repeatForward">(returnForwardSpy)
    repeatForward(s: string, n: number): string {
      return super.repeatForward(s, n);
    }
  }

  const nst = new NST_Class;
  expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(forwardSpy).toHaveBeenCalledOnceWith(nst, "foofoofoo", "foo", 3);

  expect(
    () => nst.repeatForward("foo", 0)
  ).toThrowError("result is empty");
});

it("returnTrap decorator lets us return a different value", () => {
  const { returnTrap } = NST_Aspects;

  function returnBird(
    this: NumberStringType,
    context: object,
    __rv__: string,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): string
  {
    void(context);
    void(__rv__);
    void(parameters);
    return "bird";
  }

  class NST_Class extends NumberStringClass {
    @returnTrap<"repeatForward">(returnBird)
    repeatForward(s: string, n: number): string {
      return super.repeatForward(s, n);
    }
  }

  const nst = new NST_Class;
  expect<string>(nst.repeatForward("foo", 3)).toBe("bird");
});
