// #region preamble
import type {
  Class
} from "type-fest";

import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
  getModuleDefaultClassWithArgs,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import NumberStringClass from "#aspect_dictionary/fixtures/components/shared/NumberStringClass.mjs";

import {
  getAspectDecorators,
  getAspectDictionaryForDriver,
} from "#aspect_dictionary/source/generated/AspectsDictionary.mjs";

import NumberStringClass_Spy from "#aspect_dictionary/fixtures/generated/stubs/Spy.mjs";

import type {
  HasSpy
} from "#stub_classes/source/base/mixins/spyClass.mjs";

import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";

import SpyBase from "#stage_utilities/source/SpyBase.mjs";
import NumberStringClass_PlusOneCopy from "../fixtures/bodyComponents/plusOne.mjs";

import {
  type IndeterminateClass,
} from "#aspect_dictionary/source/stubs/decorators/IndeterminateReturn.mjs";

// #endregion preamble

it(
  "Aspect dictionary integration test: we can have two levels of subclasses, one for release aspects, one for debugging-only aspects",
  async () => {
    // #region setup
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };

    const NST_Aspect = await getModuleDefaultClassWithArgs<[], NumberStringType>(
      generatedDir, "AspectDriver.mjs"
    );

    type NST_Indeterminate_Type = IndeterminateClass<NumberStringType>;
    const NST_Indeterminate = (await getModuleDefaultClass<
      NST_Indeterminate_Type
    >
    (
      generatedDir, "IndeterminateReturn.mjs"
    ));

    class SpySubclassOne extends NumberStringClass_Spy {
    }
    class SpySubclassTwo extends NumberStringClass_Spy {
    }
    class SpySubclassThree extends NumberStringClass_Spy {
    }
    // #endregion setup

    function getSpyAspect(
      instance: NumberStringType,
      index: number,
      expectedClass: Class<NumberStringClass_Spy>
    ): SpyBase
    {
      const dict = getAspectDictionaryForDriver<NumberStringType>(instance);
      const spyOwner = dict.classInvariants[index];
      expect(spyOwner).toBeInstanceOf(expectedClass);
      return (spyOwner  as unknown as HasSpy)[SPY_BASE];
    }

    const {
      classInvariants,
      bodyComponents,
    } = getAspectDecorators<NumberStringType>();

    @classInvariants(SpySubclassTwo)
    @classInvariants(SpySubclassThree)
    @bodyComponents(NST_Indeterminate)
    @bodyComponents(NumberStringClass_PlusOneCopy)
    class ReleaseNST extends NST_Aspect {
    }

    @classInvariants(SpySubclassOne)
    class DebugNST extends ReleaseNST {
    }

    const releaseInstance = new ReleaseNST;
    const debugInstance = new DebugNST;

    expect(releaseInstance.repeatForward("foo", 2)).toBe("foofoofoo");
    // release: SpySubclassTwo
    {
      const spyBase = getSpyAspect(releaseInstance, 0, SpySubclassTwo);
      spyBase.expectSpiesClearExcept("repeatForward");

      const repeatForwardSpy = spyBase.getSpy("repeatForward");
      expect(repeatForwardSpy).toHaveBeenCalledTimes(2);

      const firstCalls = repeatForwardSpy.calls.argsFor(0);
      expect(firstCalls.length).toBe(3);
      expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
      expect(firstCalls[1]).toBe("foo");
      expect(firstCalls[2]).toBe(2);

      expect(repeatForwardSpy.calls.argsFor(1)).toEqual(firstCalls);

      repeatForwardSpy.calls.reset();
    }

    // release: SpySubclassThree
    {
      const spyBase = getSpyAspect(releaseInstance, 1, SpySubclassThree);
      spyBase.expectSpiesClearExcept("repeatForward");

      const repeatForwardSpy = spyBase.getSpy("repeatForward");
      expect(repeatForwardSpy).toHaveBeenCalledTimes(2);

      const firstCalls = repeatForwardSpy.calls.argsFor(0);
      expect(firstCalls.length).toBe(3);
      expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
      expect(firstCalls[1]).toBe("foo");
      expect(firstCalls[2]).toBe(2);

      expect(repeatForwardSpy.calls.argsFor(1)).toEqual(firstCalls);

      repeatForwardSpy.calls.reset();
    }

    // release: aspects count
    {
      const dict = getAspectDictionaryForDriver<NumberStringType>(releaseInstance);
      expect(dict.classInvariants.length).toBe(2);
      expect(dict.bodyComponents.length).toBe(2);
    }

    expect(debugInstance.repeatBack(3, "foo")).toBe("foofoofoofoo");

    // debug: SpySubclassOne
    {
      const spyBase = getSpyAspect(debugInstance, 0, SpySubclassOne);
      spyBase.expectSpiesClearExcept("repeatBack");

      const repeatBackSpy = spyBase.getSpy("repeatBack");
      expect(repeatBackSpy).toHaveBeenCalledTimes(2);

      const firstCalls = repeatBackSpy.calls.argsFor(0);
      expect(firstCalls.length).toBe(3);
      expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
      expect(firstCalls[1]).toBe(3);
      expect(firstCalls[2]).toBe("foo");

      expect(repeatBackSpy.calls.argsFor(1)).toEqual(firstCalls);

      repeatBackSpy.calls.reset();
    }

    // debug: SpySubclassTwo
    {
      const spyBase = getSpyAspect(debugInstance, 1, SpySubclassTwo);
      spyBase.expectSpiesClearExcept("repeatBack");

      const repeatBackSpy = spyBase.getSpy("repeatBack");
      expect(repeatBackSpy).toHaveBeenCalledTimes(2);

      const firstCalls = repeatBackSpy.calls.argsFor(0);
      expect(firstCalls.length).toBe(3);
      expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
      expect(firstCalls[1]).toBe(3);
      expect(firstCalls[2]).toBe("foo");

      expect(repeatBackSpy.calls.argsFor(1)).toEqual(firstCalls);

      repeatBackSpy.calls.reset();
    }

    // debug: SpySubclassThree
    {
      const spyBase = getSpyAspect(debugInstance, 2, SpySubclassThree);
      spyBase.expectSpiesClearExcept("repeatBack");

      const repeatBackSpy = spyBase.getSpy("repeatBack");
      expect(repeatBackSpy).toHaveBeenCalledTimes(2);

      const firstCalls = repeatBackSpy.calls.argsFor(0);
      expect(firstCalls.length).toBe(3);
      expect(firstCalls[0]).toBeInstanceOf(NumberStringClass);
      expect(firstCalls[1]).toBe(3);
      expect(firstCalls[2]).toBe("foo");

      expect(repeatBackSpy.calls.argsFor(1)).toEqual(firstCalls);

      repeatBackSpy.calls.reset();
    }

    // debug: aspects count
    {
      const dict = getAspectDictionaryForDriver<NumberStringType>(debugInstance);
      expect(dict.classInvariants.length).toBe(3);
      expect(dict.bodyComponents.length).toBe(2);
    }

    // release: SpySubclassTwo
    {
      const spyBase = getSpyAspect(releaseInstance, 0, SpySubclassTwo);
      spyBase.expectSpiesClearExcept();
    }

    // release: SpySubclassThree
    {
      const spyBase = getSpyAspect(releaseInstance, 1, SpySubclassThree);
      spyBase.expectSpiesClearExcept();
    }
  }
);
