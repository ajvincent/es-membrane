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

import {
  type TransitionInterface,
} from "#aspects/stubs/source/types/TransitionInterface.mjs";

it("stub-ts-morph: transitions tail stub correctly forwards to the next handler", async () => {
  const generatedDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#aspects/stubs/spec-generated"
  };

  type TransitionsTail_Type = (
    BaseClass: Class<NumberStringType, []>
  ) => Class<
    TransitionInterface<true, NumberStringType, [boolean, () => Promise<void>]>
  >;

  const TransitionsTailClass = await getModulePart<"default", TransitionsTail_Type>
  (
    generatedDir,
    "stubs/TransitionsTail.mjs",
    "default"
  );

  const NST_Transitions_Tail = TransitionsTailClass(NumberStringClass);

  expect(Reflect.ownKeys(NST_Transitions_Tail.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_Transitions_Tail();
  const buildPromise = (): Promise<void> => Promise.resolve();
  expect(nst.repeatForward("bar", 6, true, buildPromise, "foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(6, "bar", false, buildPromise, 3, "foo")).toBe("foofoofoo");
});
