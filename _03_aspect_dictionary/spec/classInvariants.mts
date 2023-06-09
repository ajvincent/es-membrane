import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#aspect_dictionary/fixtures/components/shared/NumberStringClass.mjs";

import {
  AspectDecorators
} from "#aspect_dictionary/source/generated/AspectsDictionary.mjs";

import NumberStringClass_Spy from "#aspect_dictionary/fixtures/generated/stubs/Spy.mjs";

import {
  ASPECTS_DICTIONARY
} from "#aspect_dictionary/source/stubs/symbol-keys.mjs";

import type {
  HasSpy
} from "#stub_classes/source/base/spyClass.mjs";

import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";

import buildAspectOverrideClass from "./support/buildAspectOverrideClass.mjs";

import SpyBase from "#stage_utilities/source/SpyBase.mjs";

describe("Aspect weaving: supports class invariants", () => {
  const { classInvariants } = new AspectDecorators<NumberStringType>;

  it("in driver", () => {
    const NST_Aspect_Override = buildAspectOverrideClass();

    @classInvariants(NumberStringClass_Spy)
    class NST_SpyClass extends NST_Aspect_Override {
      getSpyAspect(this: NST_SpyClass): SpyBase {
        const dict = this[ASPECTS_DICTIONARY];
        const spyOwner = dict.classInvariants[0] as unknown as HasSpy;
        return spyOwner[SPY_BASE];
      }
    }

    const nstBase = new NumberStringClass;

    const nst = new NST_SpyClass(nstBase);
    expect(nst.repeatForward("foo", 3)).toBe("foofoofoo");

    const spyBase = nst.getSpyAspect();
    spyBase.expectSpiesClearExcept("repeatForward");

    const repeatForwardSpy = spyBase.getSpy("repeatForward");
    expect(repeatForwardSpy).toHaveBeenCalledTimes(2);
    expect(repeatForwardSpy.calls.argsFor(0)).toEqual([nstBase, "foo", 3]);
    expect(repeatForwardSpy.calls.argsFor(1)).toEqual([nstBase, "foo", 3]);
  });
});
