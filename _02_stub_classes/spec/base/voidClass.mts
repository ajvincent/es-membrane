import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  VoidMethodsOnly,
} from "../../source/base/types/export-types.mjs";

import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.mjs";

it("stub-ts-morph: voidClass with 'void' return types returns undefined", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../spec-generated/"
  };

  const NST_Void = await getModuleDefaultClass<VoidMethodsOnly<NumberStringType>>(
    generatedDir, "VoidClass.mjs"
  );

  expect(Reflect.ownKeys(NST_Void.prototype as NumberStringType)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_Void;
  expect(nst.repeatForward("foo", 3)).toBe(undefined);
  expect(nst.repeatBack(3, "foo")).toBe(undefined);
});
