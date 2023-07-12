import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import type {
  AssertInterface
} from "#stage_utilities/source/types/assert.mjs";

import NumberStringClass from "#aspects/decorators/fixtures/NumberStringClassAssert.mjs";

import NST_Aspects from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

it("argumentsTrap decorator lets us assert certain values", () => {
  const { argumentsTrap } = NST_Aspects;

  const forwardSpy = jasmine.createSpy();

  function callForwardSpy(
    this: NumberStringType & AssertInterface,
    context: object,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): void
  {
    void(context);
    forwardSpy(this, ...parameters);
    if (parameters[1] < 0)
      throw new Error("negative numbers don't work");
  }

  class NST_Class extends NumberStringClass {
    @argumentsTrap<"repeatForward">(callForwardSpy)
    repeatForward(s: string, n: number): string {
      return super.repeatForward(s, n);
    }
  }

  const nst = new NST_Class;
  expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(forwardSpy).toHaveBeenCalledOnceWith(nst, "foo", 3);

  expect(
    () => nst.repeatForward("foo", -1)
  ).toThrowError("negative numbers don't work");
});
