import type {
  Class
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#aspects/test-fixtures/fixtures/components/NumberStringClass.mjs";

import {
  getAspectDecorators,
  getAspectDictionaryForDriver,
} from "#aspects/dictionary/source/generated/AspectsDictionary.mjs";

import NumberStringClass_Spy from "#aspects/test-fixtures/fixtures/generated/stubs/Spy.mjs";

import type {
  HasSpy
} from "#stub_classes/source/base/mixins/spyClass.mjs";

import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";

import SpyBase from "#stage_utilities/source/SpyBase.mjs";

describe("Aspect weaving: supports class invariants", () => {
  const { classInvariants } = getAspectDecorators<NumberStringType>();

  let NST_Aspect: Class<NumberStringType>;

  beforeAll(async () => {
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };

    NST_Aspect = await getModuleDefaultClassWithArgs<[], NumberStringType>(
      generatedDir, "AspectDriver.mjs"
    );
  });

  it("in driver", () => {
    @classInvariants(NumberStringClass_Spy)
    class NST_SpyClass extends NST_Aspect {
      getSpyAspect(): SpyBase {
        const dict = getAspectDictionaryForDriver<NumberStringType>(this);
        const spyOwner = dict.classInvariants[0] as unknown as HasSpy;
        return spyOwner[SPY_BASE];
      }
    }

    const nst = new NST_SpyClass();

    expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    const spyBase = nst.getSpyAspect();
    spyBase.expectSpiesClearExcept("repeatForward");

    const repeatForwardSpy = spyBase.getSpy("repeatForward");
    expect(repeatForwardSpy).toHaveBeenCalledTimes(2);

    const firstCalls = repeatForwardSpy.calls.argsFor(0);
    expect(firstCalls.length).toBe(3);
    expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
    expect(firstCalls[1]).toBe("foo");
    expect(firstCalls[2]).toBe(3);

    expect(repeatForwardSpy.calls.argsFor(1)).toEqual(firstCalls);
  });
});
