import type {
  Class
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass_PlusOneCopy from "../fixtures/bodyComponents/plusOne.mjs";

import {
  getAspectDecorators,
} from "#aspect_dictionary/source/generated/AspectsDictionary.mjs";

import {
  type IndeterminateClass
} from "#aspect_dictionary/source/stubs/decorators/IndeterminateReturn.mjs";

type NST_Indeterminate_Type = IndeterminateClass<NumberStringType>;

describe("Aspect weaving: supports body components", () => {
  const { bodyComponents } = getAspectDecorators<NumberStringType>();

  let NST_Indeterminate: Class<NST_Indeterminate_Type>;
  let NST_Aspect: Class<NumberStringType>;

  beforeAll(async () => {
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };

    NST_Indeterminate = (await getModuleDefaultClass<
      NST_Indeterminate_Type
    >
    (
      generatedDir, "empty/IndeterminateReturn.mjs"
    ));

    NST_Aspect = await getModuleDefaultClassWithArgs<[], NumberStringType>(
      generatedDir, "empty/AspectDriver.mjs"
    );
  });

  describe("in driver", () => {
    it("with a component returning INDETERMINATE", () => {
      @bodyComponents(NST_Indeterminate)
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
