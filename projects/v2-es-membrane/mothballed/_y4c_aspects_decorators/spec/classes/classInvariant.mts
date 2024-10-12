/* eslint-disable @typescript-eslint/unbound-method */
import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NST_Aspects from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

it("Class invariants decorator can attach an invariant", () => {
  const { classInvariant } = NST_Aspects;

  const spy = jasmine.createSpy();

  function firstInvariant(this: NumberStringType): void {
    spy(this);
  }

  @classInvariant(firstInvariant)
  class NST_Class extends NumberStringClass
  {
  }

  const nst = new NST_Class;
  expect(spy).toHaveBeenCalledTimes(0);

  expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");

  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy.calls.argsFor(0)).toEqual([nst]);
  expect(spy.calls.argsFor(1)).toEqual([nst]);
});
