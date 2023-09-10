import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import {
  getModuleDefaultClass
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  stageDir
} from "../spec-build/constants.mjs";

it("NotImplementedClass stub generator creates a proper not-implemented stub", async () => {
  const NST_NotImplemented = await getModuleDefaultClass<NumberStringType>(
    stageDir, "spec-generated/NST_NotImplemented.mjs"
  );

  const nst = new NST_NotImplemented;
  expect(
    () => nst.repeatForward("foo", 3)
  ).toThrowError("not implemented");

  expect(
    () => nst.repeatBack(3, "foo")
  ).toThrowError("not implemented");
});
