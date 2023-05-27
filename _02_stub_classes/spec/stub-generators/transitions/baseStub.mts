import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import type {
  TransitionInterface,
} from "../../../source/stub-generators/base/types/export-types.mjs";

import type {
  NumberStringType
} from "../../../fixtures/types/NumberStringType.mjs";

it("stub-ts-morph: transition stub correctly inserts new arguments", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../../spec-generated/"
  };

  const NST_Transitions = await getModuleDefaultClass<
    TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>
  >(
    generatedDir, "TransitionsMiddle.mjs"
  );

  expect(Reflect.ownKeys(NST_Transitions.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_Transitions;
  const buildPromise = (): Promise<void> => Promise.resolve();
  expect(nst.repeatForward("bar", 6, true, buildPromise, "foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(6, "bar", false, buildPromise, 3, "foo")).toBe("foofoofoo");
});
