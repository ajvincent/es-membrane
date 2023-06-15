import type { Class } from "type-fest";

import {
  type ModuleSourceDirectory,
  getModulePart,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  PrototypeOf
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  NumberStringType
} from "#stub_classes/fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#stub_classes/fixtures/components/shared/NumberStringClass.mjs";

describe("stub-ts-morph: wrapInFunction", () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../spec-generated/"
  };

  it("with default return types throws for all methods", async () => {
    const NST_WrapInFunction = await getModulePart<
      "default",
      (baseClass: Class<NumberStringType>) => Class<NumberStringType & { _calls: string[] }>
    >
    (
      generatedDir, "HelloWorld.mjs", "default"
    );

    const NST_Class = NST_WrapInFunction(NumberStringClass);

    expect(Reflect.ownKeys(NST_Class.prototype as PrototypeOf<typeof NST_Class>)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const nst = new NST_Class;
    expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    expect(nst.repeatBack(3, "foo")).toBe("foofoofoo");

    expect(nst._calls).toEqual(["repeatForward", "repeatBack"]);
  });
});
