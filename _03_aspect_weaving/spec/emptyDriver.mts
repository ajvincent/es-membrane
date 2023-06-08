import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#aspect_weaving/fixtures/components/shared/NumberStringClass.mjs";

import {
  type ClassWithAspects,
} from "#aspect_weaving/source/generated/AspectsDictionary.mjs";

import {
  ASPECTS_BUILDER,
} from "#aspect_weaving/source/stubs/symbol-keys.mjs";

import buildAspectOverrideClass from "./support/buildAspectOverrideClass.mjs";

it("Aspect weaving: an empty aspect driver still works", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/"
  };

  const NST_Aspect = await getModuleDefaultClass<NumberStringType>(
    generatedDir, "empty/AspectDriver.mjs"
  ) as ClassWithAspects<NumberStringType>;

  expect(Reflect.ownKeys(NST_Aspect.prototype as object)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack",
    ASPECTS_BUILDER,
  ]);

  const NST_Aspect_Override = buildAspectOverrideClass();

  class NST_Empty extends NST_Aspect_Override {
  }

  const nstWrapped = new NumberStringClass;

  const nst = new NST_Empty(nstWrapped);

  expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(3, "foo")).toBe("foofoofoo");
});
