import type {
  Class
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "#aspect_drivers/fixtures/types/NumberStringType.mjs";

import NumberStringClass_Spy from "#aspect_drivers/source/generated/stubs/Spy.mjs";

import {
  getAspectDictionaryForDriver,
  getAspectDecorators,
} from "#aspect_drivers/source/generated/AspectsDictionary.mjs";

describe("AspectsDictionary", () => {
  // #region beforeAll
  class SpySubclassOne extends NumberStringClass_Spy {
  }
  class SpySubclassTwo extends NumberStringClass_Spy {
  }
  class SpySubclassThree extends NumberStringClass_Spy {
  }

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
  // #endregion beforeAll

  it("getAspectDecorators<Type> with an AspectDriver installs the requested decorators", () => {
    const { classInvariants } = getAspectDecorators<NumberStringType>();

    @classInvariants(SpySubclassTwo)
    @classInvariants(SpySubclassThree)
    class NST_Decorated extends NST_Aspect {
    }

    const decorated = new NST_Decorated;
    {
      const aspects = getAspectDictionaryForDriver(decorated);

      expect(aspects.classInvariants.length).toBe(2);
      expect(aspects.classInvariants[0]).toBeInstanceOf(SpySubclassTwo);
      expect(aspects.classInvariants[1]).toBeInstanceOf(SpySubclassThree);
    }

    @classInvariants(SpySubclassOne)
    class NST_Subclassed extends NST_Decorated {
    }

    const subclassed = new NST_Subclassed;
    {
      const aspects = getAspectDictionaryForDriver(subclassed);

      expect(aspects.classInvariants.length).toBe(3);
      expect(aspects.classInvariants[0]).toBeInstanceOf(SpySubclassOne);
      expect(aspects.classInvariants[1]).toBeInstanceOf(SpySubclassTwo);
      expect(aspects.classInvariants[2]).toBeInstanceOf(SpySubclassThree);
    }
  });
});
