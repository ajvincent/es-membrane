/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  type ModuleSourceDirectory,
  getModulePart,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import NumberStringClass from "#aspect_dictionary/fixtures/components/shared/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#aspect_dictionary/fixtures/types/NumberStringType.mjs";

import type {
  AspectBuilderGetter,
  AspectDictionaryBuilder,
  AspectDictionaryGetter,
  AspectDecoratorsGetter
} from "./types/AspectsDictionary-internal.mjs";

import NumberStringClass_Spy from "#aspect_dictionary/fixtures/generated/stubs/Spy.mjs";

describe("AspectsDictionary", () => {
  // #region beforeAll
  class NST_Base extends NumberStringClass {
  }

  class SpySubclassOne extends NumberStringClass_Spy {
  }
  class SpySubclassTwo extends NumberStringClass_Spy {
  }
  class SpySubclassThree extends NumberStringClass_Spy {
  }

  class NST_Middle extends NST_Base {
  }

  class NST_Final extends NST_Middle {
  }

  let getAspectBuilderForClass: AspectBuilderGetter<NumberStringType>;

  type AspectBuilder = ReturnType<AspectBuilderGetter<NumberStringType>>;
  let baseBuilder: AspectBuilder;
  let middleBuilder: AspectBuilder;
  let finalBuilder: AspectBuilder;

  let buildAspectDictionaryForDriver: AspectDictionaryBuilder<NumberStringType>;
  let getAspectDictionaryForDriver: AspectDictionaryGetter<NumberStringType>;
  let getAspectDecorators: AspectDecoratorsGetter<NumberStringType>;

  beforeAll(async () => {
    const generatedDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated/"
    };

    getAspectBuilderForClass = await getModulePart<
      "getAspectBuilderForClass",
      AspectBuilderGetter<NumberStringType>
    >
    (
      generatedDir,
      "AspectsDictionary.mjs",
      "getAspectBuilderForClass",
    );

    baseBuilder = getAspectBuilderForClass(NST_Base);
    (baseBuilder.classInvariants as unknown[]).splice(0, baseBuilder.classInvariants.length);
  
    middleBuilder = getAspectBuilderForClass(NST_Middle);
    middleBuilder.classInvariants.push(SpySubclassOne, SpySubclassTwo);

    finalBuilder = getAspectBuilderForClass(NST_Final);
    finalBuilder.classInvariants.push(SpySubclassThree);

    buildAspectDictionaryForDriver = await getModulePart<
      "buildAspectDictionaryForDriver",
      AspectDictionaryBuilder<NumberStringType>
    >
    (
      generatedDir,
      "AspectsDictionary.mjs",
      "buildAspectDictionaryForDriver"
    );

    getAspectDictionaryForDriver = await getModulePart<
      "getAspectDictionaryForDriver",
      AspectDictionaryGetter<NumberStringType>
    >
    (
      generatedDir,
      "AspectsDictionary.mjs",
      "getAspectDictionaryForDriver"
    );

    getAspectDecorators = await getModulePart<
      "getAspectDecorators",
      AspectDecoratorsGetter<NumberStringType>
    >
    (
      generatedDir,
      "AspectsDictionary.mjs",
      "getAspectDecorators"
    );
  }, 1000 * 60 * 60);
  // #endregion beforeAll

  it("getAspectBuilderForClass() inserts constructors in the right order", () => {
    class NST_Other extends NST_Base {
    }

    const otherBuilder = getAspectBuilderForClass(NST_Other);

    expect(middleBuilder.classInvariants).toEqual([
      SpySubclassOne,
      SpySubclassTwo,
    ]);

    expect(finalBuilder.classInvariants).toEqual([
      SpySubclassOne,
      SpySubclassTwo,
      SpySubclassThree,
    ]);

    expect(otherBuilder.classInvariants).toEqual([]);
  }, 1000 * 60 * 60);

  it("getAspectDictionaryForObject creates aspects in the right order", () => {
    const middleObject = new NST_Middle;

    const middleAspects = buildAspectDictionaryForDriver(middleObject, new NumberStringClass);

    expect(middleAspects.classInvariants.length).toBe(2);
    expect(middleAspects.classInvariants[0]).toBeInstanceOf(SpySubclassOne);
    expect(middleAspects.classInvariants[1]).toBeInstanceOf(SpySubclassTwo);

    expect(
      getAspectDictionaryForDriver(middleObject)
    ).toBe(middleAspects);

    const otherObject = new NST_Middle;
    const otherAspects = buildAspectDictionaryForDriver(otherObject, new NumberStringClass);
    expect(otherAspects).not.toBe(middleAspects);

    expect(otherAspects.classInvariants.length).toBe(2);
    expect(otherAspects.classInvariants[0]).toBeInstanceOf(SpySubclassOne);
    expect(otherAspects.classInvariants[1]).toBeInstanceOf(SpySubclassTwo);

    expect(otherAspects.classInvariants[0]).not.toBe(middleAspects.classInvariants[0]);
    expect(otherAspects.classInvariants[1]).not.toBe(middleAspects.classInvariants[1]);

    const finalObject = new NST_Final;
    const finalAspects = buildAspectDictionaryForDriver(finalObject, new NumberStringClass);

    expect(finalAspects.classInvariants.length).toBe(3);
    expect(finalAspects.classInvariants[0]).toBeInstanceOf(SpySubclassOne);
    expect(finalAspects.classInvariants[1]).toBeInstanceOf(SpySubclassTwo);
    expect(finalAspects.classInvariants[2]).toBeInstanceOf(SpySubclassThree);

    expect(finalAspects.classInvariants[0]).not.toBe(middleAspects.classInvariants[0]);
    expect(finalAspects.classInvariants[1]).not.toBe(middleAspects.classInvariants[1]);

    expect(finalAspects.classInvariants[0]).not.toBe(otherAspects.classInvariants[0]);
    expect(finalAspects.classInvariants[1]).not.toBe(otherAspects.classInvariants[1]);
  });

  it("getAspectDecorators<Type> gets a collection of aspect decorators", () => {
    const { classInvariants } = getAspectDecorators();

    @classInvariants(SpySubclassTwo)
    @classInvariants(SpySubclassThree)
    class NST_Decorated extends NST_Base {
    }

    const decoratedBuilder = getAspectBuilderForClass(NST_Decorated);
    expect(decoratedBuilder.classInvariants).toEqual([
      SpySubclassTwo,
      SpySubclassThree,
    ]);

    const decorated = new NST_Decorated;
    const aspects = buildAspectDictionaryForDriver(decorated, new NumberStringClass);

    expect(aspects.classInvariants.length).toBe(2);
    expect(aspects.classInvariants[0]).toBeInstanceOf(SpySubclassTwo);
    expect(aspects.classInvariants[1]).toBeInstanceOf(SpySubclassThree);

    @classInvariants(SpySubclassOne)
    class NST_Subclassed extends NST_Decorated {
    }

    const subclassedBuilder = getAspectBuilderForClass(NST_Subclassed);
    expect(subclassedBuilder.classInvariants).toEqual([
      SpySubclassOne,
      SpySubclassTwo,
      SpySubclassThree,
    ]);
  });
});
