import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import type {
  ClassWithAspects
} from "#aspect_weaving/source/AspectsDictionary.mjs";

import AspectDecorators from "#aspect_weaving/source/decorators/aspects.mjs";

import NumberStringClass_Spy from "#aspect_weaving/fixtures/generated/stubs/Spy.mjs";

import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";

describe("Aspect weaving: supports class invariants", () => {
  let NST_Aspect: ClassWithAspects<NumberStringType>;
  beforeAll(async () => {
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };
  
    NST_Aspect = (await getModuleDefaultClass<NumberStringType>(
      generatedDir, "empty/AspectDriver.mjs"
    )) as ClassWithAspects<NumberStringType>;
  });

  it("in driver", () => {
    const { classInvariants } = new AspectDecorators<NumberStringType>;
    const spyObject = new NumberStringClass_Spy;

    @classInvariants(spyObject)
    class NST_SpyClass extends NST_Aspect {
    }

    const nst = new NST_SpyClass;
    expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    const spyBase = spyObject[SPY_BASE];
    spyBase.expectSpiesClearExcept("repeatForward");

    const repeatForwardSpy = spyBase.getSpy("repeatForward");
    expect(repeatForwardSpy).toHaveBeenCalledTimes(2);
    expect(repeatForwardSpy.calls.argsFor(0)).toEqual([nst, ["foo", 3]]);
    expect(repeatForwardSpy.calls.argsFor(1)).toEqual([nst, ["foo", 3]]);
  });
});
