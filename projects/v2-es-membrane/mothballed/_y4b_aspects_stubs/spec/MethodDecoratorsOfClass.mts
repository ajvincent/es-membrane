import {
  type Class,
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModulePart,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";

it("MethodDecoratorsOfClass applies decorators from a configuration to build a class", async () => {
  const generatedDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#aspects/stubs/spec-generated"
  };

  type SpyDecoratedClass_Type = (
    BaseClass: Class<NumberStringType>
  ) => Class<NumberStringType>;

  const MethodDecoratedClass = await getModulePart<"default", SpyDecoratedClass_Type>
  (
    generatedDir,
    "stubs/SpyMethodDecorated.mjs",
    "default"
  );

  const NST_Class = MethodDecoratedClass(NumberStringClass);
  const nst = new NST_Class;

  expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");

  expect(
    (NST_Class as unknown as { backEvents: unknown[]}).backEvents
  ).toEqual([["repeatBack", 3, "foo"]]);
});
