import {
  type Class,
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModulePart,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  UnshiftableArray
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  SharedAssertionObserver,
} from "#stage_utilities/source/types/assert.mjs";

import SharedAssertSet from "#stage_utilities/source/SharedAssertSet.mjs";

import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";

describe("ClassInvariantsWrapper", () => {
  const generatedDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#aspects/stubs/spec-generated"
  };

  type ClassInvariantsWrapper_Type = (
    baseClass: Class<NumberStringType>,
    invariantsArray: UnshiftableArray<(this: NumberStringType) => void>
  ) => Class<NumberStringType & SharedAssertionObserver, [SharedAssertSet, ...unknown[]]>;

  let ClassInvariantsWrapper: ClassInvariantsWrapper_Type;
  beforeAll(async () => {
    ClassInvariantsWrapper = await getModulePart<"default", ClassInvariantsWrapper_Type>
    (
      generatedDir,
      "stubs/ClassInvariantsWrapper.mjs",
      "default",
    );
  });

  it("invariants work", () => {
    const invariantsArray: UnshiftableArray<(this: NumberStringType) => void> = [];
    const NST_Class = ClassInvariantsWrapper(NumberStringClass, invariantsArray);

    const sharedAsserts = new SharedAssertSet;
    const nst = new NST_Class(sharedAsserts);

    expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");

    const spy = jasmine.createSpy();
    invariantsArray.unshift(spy);

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

  it("direct assert failures kill an instance", () => {
    const invariantsArray: UnshiftableArray<(this: NumberStringType) => void> = [];
    const NST_Class = ClassInvariantsWrapper(NumberStringClass, invariantsArray);

    const sharedAsserts = new SharedAssertSet;
    const nst = new NST_Class(sharedAsserts);

    expect(() => {
      nst.assert(false, "whoops");
    }).toThrowError();

    expect(() => {
      nst.repeatForward("foo", 3);
    }).toThrowError();
  });

  it("indirect assert failures kill an instance", () => {
    const invariantsArray: UnshiftableArray<(this: NumberStringType) => void> = [];
    const NST_Class = ClassInvariantsWrapper(NumberStringClass, invariantsArray);

    const sharedAsserts = new SharedAssertSet;
    const nst = new NST_Class(sharedAsserts);

    const otherAssert: SharedAssertionObserver = {
      observeAssertFailed: function (this: object, forSelf: boolean): void {
        void(forSelf);
      },
      assert: function (this: object, condition: boolean, message: string): void {
        void(condition);
        void(message);
        throw new Error("Function not implemented.");
      }
    };
    sharedAsserts.buildShared(otherAssert);

    expect(() => {
      otherAssert.assert(false, "whoops");
    }).toThrowError();

    expect(() => {
      nst.repeatForward("foo", 3);
    }).toThrowError();
  });
});
