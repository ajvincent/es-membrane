import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
  getModuleDefaultClassWithArgs,
} from "../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import type {
  TransitionInterface,
} from "../../../source/aspects/export-types.mjs";

import type {
  NumberStringType
} from "../../../fixtures/types/NumberStringType.mjs";

it("stub-ts-morph: transition entry stub correctly inserts new arguments", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../../spec-generated/"
  };

  type NST_TransitionsInterface = TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>;

  const NST_Transitions = await getModuleDefaultClass<NST_TransitionsInterface>(
    generatedDir, "components/transition/NST_Base.mjs"
  );

  const NST_TransitionsEntry = await getModuleDefaultClassWithArgs<
    [NST_TransitionsInterface], NumberStringType
  >
  (
    generatedDir, "components/transition/NST_Entry.mjs"
  );

  expect(Reflect.ownKeys(NST_TransitionsEntry.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_TransitionsEntry(new NST_Transitions);

  // I can't really test what the transitions entry class passes to the transition class.
  // I don't have a spy class yet.

  const result = "foo_tailfoo_tailfoo_tailfoo_tail";
  expect(nst.repeatForward("foo", 3)).toBe(result);
  expect(nst.repeatBack(3, "foo")).toBe(result);
});
