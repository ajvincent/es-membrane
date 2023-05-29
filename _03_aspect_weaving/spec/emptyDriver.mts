import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

it("Aspect weaving: an empty aspect driver still works", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/"
  };

  const NST_Aspect = await getModuleDefaultClass<NumberStringType>(
    generatedDir, "empty/AspectDriver.mjs"
  );

  expect(Reflect.ownKeys(NST_Aspect.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack",
  ]);

  const nst = new NST_Aspect;

  expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(3, "foo")).toBe("foofoofoo");
});
