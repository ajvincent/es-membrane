import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import type {
  MethodsPrependReturn
} from "../../source/aspects/public-types/MethodsPrependReturn.mjs";

import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.mjs";

it("stub-ts-morph: PrependReturnClass with prepended return arguments returns undefined", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../spec-generated/"
  };

  const NST_PrependReturn = await getModuleDefaultClass<
    MethodsPrependReturn<NumberStringType>
  >
  (
    generatedDir, "components/common/NST_PrependReturn.mjs"
  );

  expect(Reflect.ownKeys(NST_PrependReturn.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_PrependReturn;
  expect(nst.repeatForward("foofoofoo", "foo", 3)).toBe(undefined);
  expect(nst.repeatBack("foofoofoo", 3, "foo")).toBe(undefined);
});
