import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  WrapThisAndParameters,
} from "../../source/base/types/export-types.mjs";

import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.mjs";

it("stub-ts-morph: WrapThisInner class wraps the `this` argument and parameters", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../spec-generated/"
  };

  const NST_NotImplemented = await getModuleDefaultClass<NumberStringType>(
    generatedDir, "NotImplemented.mjs"
  );

  const NST_WrapThisInner = await getModuleDefaultClass<WrapThisAndParameters<NumberStringType>>(
    generatedDir, "WrapThisInner.mjs"
  );

  expect(Reflect.ownKeys(NST_WrapThisInner.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack",
  ]);

  const nst = new NST_NotImplemented;
  const nst_wrapped = new NST_WrapThisInner;
  expect(nst_wrapped.repeatForward(nst, ["foo", 3])).toBe(undefined);
  expect(nst_wrapped.repeatBack(nst, [3, "foo"])).toBe(undefined);
});
