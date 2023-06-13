import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import {
  hasAspectBuilderForClass,
} from "#aspects/driver/source/generated/AspectsDictionary.mjs";

it("Aspect weaving: an empty aspect driver still works", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/"
  };

  const NST_Aspect = await getModuleDefaultClass<NumberStringType>(
    generatedDir, "AspectDriver.mjs"
  );

  expect(hasAspectBuilderForClass<NumberStringType>(NST_Aspect)).toBe(true);

  expect(Reflect.ownKeys(NST_Aspect.prototype as object)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack",
  ]);

  class NST_Empty extends NST_Aspect {
  }

  const nst = new NST_Empty();

  expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(3, "foo")).toBe("foofoofoo");
});
