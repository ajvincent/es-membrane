/*
import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  PrototypeOf
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  TransitionInterface,
} from "../source/types/TransitionInterface.mjs";

import type {
  NumberStringType
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";
*/

import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";

import TransitionsTailClass from "#aspects/test-fixtures/fixtures/generated/stubs/TransitionsTail.mjs";

it("stub-ts-morph: transitions tail stub correctly forwards to the next handler", () => {
  /*
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../_03z_aspects_test_fixtures/fixtures/generated/stubs"
  };
  const NST_Transitions_Tail = await getModulePart<
    [], TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>
  >
  (
    generatedDir, "default", "TransitionsTail.mjs"
  );
  */

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
