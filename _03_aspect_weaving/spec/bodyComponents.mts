import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#aspect_weaving/fixtures/components/shared/NumberStringClass.mjs";

import NumberStringClass_PlusOneCopy from "../fixtures/bodyComponents/plusOne.mjs";

import {
  AspectDecorators,
  type ClassWithAspects,
} from "#aspect_weaving/source/generated/AspectsDictionary.mjs";

import {
  type IndeterminateClass
} from "#aspect_weaving/source/stubs/decorators/IndeterminateReturn.mjs";

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

    NST_Indeterminate = (await getModuleDefaultClassWithArgs<
      [NumberStringType], unknown
    >
    (
      generatedDir, "empty/IndeterminateReturn.mjs"
    )) as ClassWithAspects<NST_Indeterminate_Type>;
  });

  describe("in driver", () => {
    it("with a component returning INDETERMINATE", () => {
      const NST_Aspect_Override = buildAspectOverrideClass();

      @bodyComponents(NST_Indeterminate)
      class NST_PassThrough extends NST_Aspect_Override {
      }

      const nst = new NST_PassThrough(new NumberStringClass);
      expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    });

    it("with a component returning a value", () => {
      const NST_Aspect_Override = buildAspectOverrideClass();

      @bodyComponents(NumberStringClass_PlusOneCopy)
      class NST_PlusOne extends NST_Aspect_Override {
      }

      const nst = new NST_PlusOne(new NumberStringClass);
      expect(nst.repeatForward("foo", 2)).toBe("foofoofoo");
    });
  });
});