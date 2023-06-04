import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import {
  AspectDecorators
} from "#aspect_weaving/source/generated/AspectsDictionary.mjs";

import NumberStringClass_Spy from "#aspect_weaving/fixtures/generated/stubs/Spy.mjs";

import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";
import buildAspectOverrideClass from "./support/buildAspectOverrideClass.mjs";

describe("Aspect weaving: supports class invariants", () => {
  const { classInvariants } = new AspectDecorators<NumberStringType>;

  it("in driver", () => {
    const spyObject = new NumberStringClass_Spy;

    const NST_Aspect_Override = buildAspectOverrideClass();

    @classInvariants(() => spyObject)
    class NST_SpyClass extends NST_Aspect_Override {
    }

    const nst = new NST_SpyClass;
    expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    const spyBase = spyObject[SPY_BASE];
    spyBase.expectSpiesClearExcept("repeatForward");

    const repeatForwardSpy = spyBase.getSpy("repeatForward");
    expect(repeatForwardSpy).toHaveBeenCalledTimes(2);
    expect(repeatForwardSpy.calls.argsFor(0)).toEqual([nst, ["foo", 3]]);
    expect(repeatForwardSpy.calls.argsFor(1)).toEqual([nst, ["foo", 3]]);
  });
});
