import type {
  Class
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";


import {
  getAspectDecorators,
} from "#aspects/dictionary/source/generated/AspectsDictionary.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass_IndeterminateReturn from "../source/generated/stubs/IndeterminateReturn.mjs";
import NumberStringClass_PlusOneCopy from "../fixtures/bodyComponents/plusOne.mjs";

describe("Aspect weaving: supports body components", () => {
  const { bodyComponents } = getAspectDecorators<NumberStringType>();

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

  describe("in driver", () => {
    it("with a component returning INDETERMINATE", () => {
      @bodyComponents(NumberStringClass_IndeterminateReturn)
      class NST_PassThrough extends NST_Aspect {
      }

      const nst = new NST_PassThrough();
      expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    });

    it("with a component returning a value", () => {
      @bodyComponents(NumberStringClass_PlusOneCopy)
      class NST_PlusOne extends NST_Aspect {
      }

      const nst = new NST_PlusOne();
      expect(nst.repeatForward("foo", 2)).toBe("foofoofoo");
    });
  });
});
