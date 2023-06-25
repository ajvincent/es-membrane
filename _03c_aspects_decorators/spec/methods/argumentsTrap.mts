import argumentsTrap from "#aspects/decorators/source/methods/argumentsTrap.mjs";

import NumberStringClass from "#aspects/test-fixtures/fixtures/components/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";

it("argumentsTrap decorator lets us assert certain values", () => {
  const forwardSpy = jasmine.createSpy();

  function callForwardSpy(
    this: NumberStringType,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): void
  {
    forwardSpy(this, ...parameters);
    if (parameters[1] < 0)
      throw new Error("negative numbers don't work");
  }

  class NST_Class extends NumberStringClass {
    @argumentsTrap<NumberStringType, "repeatForward">(callForwardSpy)
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
