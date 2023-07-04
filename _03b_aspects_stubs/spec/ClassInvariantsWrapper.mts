import {
  type ModuleSourceDirectory,
  getModulePart,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  UnshiftableArray
} from "#stage_utilities/source/types/Utility.mjs";

import {
  type Class,
} from "#mixin_decorators/source/types/Class.mjs";

import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";

import {
  CLASS_INVARIANTS,
} from "#aspects/stubs/source/symbol-keys.mjs";

it("ClassInvariantsWrapper ", async () => {
  const generatedDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#aspects/stubs/spec-generated"
  };

  type ClassInvariantsWrapper_Type = (
    BaseClass: Class<NumberStringType>
  ) => Class<NumberStringType> & {
    readonly [CLASS_INVARIANTS]: UnshiftableArray<(this: NumberStringType) => void>
  }

  const ClassInvariantsWrapper = await getModulePart<"default", ClassInvariantsWrapper_Type>
  (
    generatedDir,
    "stubs/ClassInvariantsWrapper.mjs",
    "default",
  );

  const NST_Class = ClassInvariantsWrapper(NumberStringClass);
  const nst = new NST_Class;

  expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");

  const spy = jasmine.createSpy();
  NST_Class[CLASS_INVARIANTS].unshift(spy);

  expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");
  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy.calls.argsFor(0)).toEqual([]);
  expect(spy.calls.thisFor(0)).toBe(nst);
  expect(spy.calls.argsFor(1)).toEqual([]);
  expect(spy.calls.thisFor(1)).toBe(nst);

  spy.calls.reset();
  spy.and.throwError("abort");

  expect(
    () => nst.repeatForward("foo", 3)
  ).toThrowError("abort");
  expect(spy).toHaveBeenCalledTimes(1);
});
