import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass_PlusOneCopy from "../fixtures/bodyComponents/plusOne.mjs";

import {
  type ClassWithAspects,
} from "#aspect_weaving/source/generated/AspectsDictionary.mjs";

import {
  type IndeterminateClass
} from "#aspect_weaving/source/stub-decorators/IndeterminateReturn.mjs";

import AspectDecorators from "#aspect_weaving/source/decorators/aspects.mjs";
import buildAspectOverrideClass from "./support/buildAspectOverrideClass.mjs";

type NST_Indeterminate_Type = IndeterminateClass<NumberStringType>;

describe("Aspect weaving: supports body components", () => {
  const { bodyComponents } = new AspectDecorators<NumberStringType>;

  let NST_Indeterminate: ClassWithAspects<NST_Indeterminate_Type>;

  beforeAll(async () => {
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };

    NST_Indeterminate = (await getModuleDefaultClass<NST_Indeterminate_Type>(
      generatedDir, "empty/IndeterminateReturn.mjs"
    )) as ClassWithAspects<NST_Indeterminate_Type>;
  });

  describe("in driver", () => {
    it("with a component returning INDETERMINATE", () => {
      const NST_Aspect_Override = buildAspectOverrideClass();

      @bodyComponents(() => new NST_Indeterminate)
      class NST_PassThrough extends NST_Aspect_Override {
      }

      const nst = new NST_PassThrough;
      expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    });

    it("with a component returning a value", () => {
      const NST_Aspect_Override = buildAspectOverrideClass();

      @bodyComponents(() => new NumberStringClass_PlusOneCopy)
      class NST_PlusOne extends NST_Aspect_Override {
      }

      const nst = new NST_PlusOne;
      expect(nst.repeatForward("foo", 2)).toBe("foofoofoo");
    });
  });
});
