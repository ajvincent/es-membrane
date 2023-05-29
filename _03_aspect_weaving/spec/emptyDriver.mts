import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "../fixtures/components/shared/NumberStringClass.mjs";
import INNER_TARGET_KEY, {
  type WrapWithInnerTargetKey,
} from "#aspect_weaving/source/innerTargetSymbol.mjs";

it("Aspect weaving: an empty aspect driver still works", async () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/"
  };

  const NST_Aspect = await getModuleDefaultClass<WrapWithInnerTargetKey<NumberStringType>>(
    generatedDir, "empty/AspectDriver.mjs"
  );

  expect(Reflect.ownKeys(NST_Aspect.prototype)).toEqual([
    "constructor",
    "repeatForward",
    "repeatBack",
    INNER_TARGET_KEY,
  ]);

  const nst_base = new NumberStringClass;

  const nst = new NST_Aspect;
  nst[INNER_TARGET_KEY](nst_base);

  expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  expect(nst.repeatBack(3, "foo")).toBe("foofoofoo");
});
