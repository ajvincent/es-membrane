import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  type NumberStringType,
} from "#aspect_dictionary/fixtures/types/NumberStringType.mjs";

import {
  INDETERMINATE,
  type IndeterminateClass,
} from "#aspect_dictionary/source/stubs/decorators/IndeterminateReturn.mjs";

type NST_Indeterminate_Type = IndeterminateClass<NumberStringType>;

it("Indeterminate return class returns a symbol, INDETERMINATE, for every method", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/"
  };

  const NST_Indeterminate = (await getModuleDefaultClass<
    NST_Indeterminate_Type
  >
  (
    generatedDir, "empty/IndeterminateReturn.mjs"
  ));

  const nst = new NST_Indeterminate;
  expect(nst.repeatForward("foo", 3)).toBe(INDETERMINATE);
  expect(nst.repeatBack(3, "foo")).toBe(INDETERMINATE);
});
