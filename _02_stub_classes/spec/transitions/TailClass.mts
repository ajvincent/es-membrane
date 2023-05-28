import {
  type ModuleSourceDirectory,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  TransitionInterface,
} from "../../source/base/types/export-types.mjs";

import type {
  NumberStringType
} from "../../fixtures/types/NumberStringType.mjs";
import NumberStringClass from "../../fixtures/components/shared/NumberStringClass.mjs";

it("stub-ts-morph: transitions tail stub correctly forwards to the next handler", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../spec-generated/"
  };

  const NST_Transitions_Tail = await getModuleDefaultClassWithArgs<
    [NumberStringType], TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>
  >(
    generatedDir, "TransitionsTail.mjs"
  );

  expect(Reflect.ownKeys(NST_Transitions_Tail.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack"
  ]);

  const nst = new NST_Transitions_Tail(new NumberStringClass);
  const buildPromise = (): Promise<void> => Promise.resolve();
  expect(nst.repeatForward("bar", 6, true, buildPromise, "foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(6, "bar", false, buildPromise, 3, "foo")).toBe("foofoofoo");
});
