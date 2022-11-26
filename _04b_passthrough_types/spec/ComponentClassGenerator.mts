import type { NumberStringType } from "../fixtures/NumberStringType.mjs";
import type { ComponentPassThroughClass } from "../source/exports/internal/PassThroughSupport.mjs";
import type {
  InstanceToComponentMap_TypeDefault,
  ComponentMapOverride,
} from "../source/exports/KeyToComponentMap_Base.mjs";
import type { Entry_BaseType } from "../source/exports/internal/Common.mjs";

import {
  getModuleDefaultClass,
  getModulePart,
  ModuleSourceDirectory
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

type PassThroughClassType = ComponentPassThroughClass<NumberStringType, NumberStringType>;
type PassThroughClassWithSpy = PassThroughClassType & { spy: jasmine.Spy };

describe("Component class generator", () => {
  // Required because a completely resolved URI at build time doesn't exist.
  const moduleSource: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/component-classes"
  };

  let BaseClass: new () => NumberStringType;
  let SpyClass: new () => PassThroughClassWithSpy;
  let ComponentMap: InstanceToComponentMap_TypeDefault<NumberStringType, NumberStringType>;
  let EntryClass: new () => NumberStringType;
  let ContinueClass: new () => PassThroughClassType;
  let ThrowClass: new () => PassThroughClassType;

  beforeAll(async () => {
    BaseClass = await getModuleDefaultClass<NumberStringType>(moduleSource, "BaseClass.mjs");
    SpyClass = await getModuleDefaultClass<PassThroughClassWithSpy>(moduleSource, "PassThrough_JasmineSpy.mjs");
    EntryClass = await getModuleDefaultClass<Entry_BaseType<NumberStringType>>(moduleSource, "EntryClass.mjs");
    ContinueClass = await getModuleDefaultClass<PassThroughClassType>(moduleSource, "PassThrough_Continue.mjs");
    ThrowClass = await getModuleDefaultClass<PassThroughClassType>(moduleSource, "PassThrough_NotImplemented.mjs");

    ComponentMap = await getModulePart<
      InstanceToComponentMap_TypeDefault<NumberStringType, NumberStringType>
    >(moduleSource, "internal/PassThroughClassType.mjs", "default");
  });

  it("creates the base 'not-yet implemented' class", () => {
    expect(Reflect.ownKeys(BaseClass.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new BaseClass;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it("creates a spy class for use by the key-to-component map", () => {
    /* Why does this test exist?  Yes, we're copying KeyToComponentMap_Base from source/exports.
       This tests that the generated pass-through classes are compatible components for the
       key-to-component maps.
    */
    expect(Reflect.ownKeys(SpyClass.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const spyInstanceReturn = new SpyClass;
    expect(Reflect.ownKeys(spyInstanceReturn)).toEqual([
      "spy"
    ]);

    spyInstanceReturn.spy.and.callFake(() => {
      return "The spice must flow."
    });

    const instance = new BaseClass;

    {
      const config : ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["spy", spyInstanceReturn],
        ]),
        sequences: new Map,
        startComponent: "spy",
      };
      ComponentMap.override(instance, config);
    }

    const passThrough = ComponentMap.buildPassThrough<
      NumberStringType["repeatForward"]
    >(instance, "repeatForward", ["foo", 3]);

    passThrough.callTarget("spy");
    expect(passThrough.getReturnValue()).toEqual([true, "The spice must flow."]);

    const args = spyInstanceReturn.spy.calls.argsFor(0);
    expect(args[0]).toBe("repeatForward");
    expect(args[1]).toBe(passThrough);
    expect(args[1].entryPoint).toBe(instance);
    expect(args[2]).toBe("foo");
    expect(args[3]).toBe(3);
    expect(args.length).toBe(4);

    expect(spyInstanceReturn.spy).toHaveBeenCalledTimes(1);
  });

  it("creates an entry class which invokes the key-to-component map", () => {
    const spyInstanceReturn = new SpyClass;
    spyInstanceReturn.spy.and.callFake(() => {
      return "Fear is the mind-killer."
    });

    const instance = new EntryClass;

    {
      const config : ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["spy", spyInstanceReturn],
        ]),
        sequences: new Map,
        startComponent: "spy",
      };
      ComponentMap.override(instance, config);
    }

    expect(instance.repeatBack(3, "foo")).toBe("Fear is the mind-killer.");

    const args = spyInstanceReturn.spy.calls.argsFor(0);
    expect(args[0]).toBe("repeatBack");
    // I can't really check args[1], as that's a PassThroughArgument I haven't seen.
    expect(args[1].entryPoint).toBe(instance);
    expect(args[2]).toBe("foo");
    expect(args[3]).toBe(3);
    expect(args.length).toBe(4);

    expect(spyInstanceReturn.spy).toHaveBeenCalledTimes(1);
  });

  it("creates an extended continue component class", () => {
    const spyInstanceReturn = new SpyClass;
    spyInstanceReturn.spy.and.callFake(() => {
      return "Law is the ultimate science."
    });

    const instance = new EntryClass;
    {
      const config : ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["spy", spyInstanceReturn],
          ["continue", new ContinueClass],
        ]),
        sequences: new Map([
          ["sequence", ["continue", "spy"]],
        ]),
        startComponent: "sequence",
      };
      ComponentMap.override(instance, config);
    }

    expect(instance.repeatBack(3, "foo")).toBe("Law is the ultimate science.");

    const args = spyInstanceReturn.spy.calls.argsFor(0);
    expect(args[0]).toBe("repeatBack");
    expect(args[1].entryPoint).toBe(instance);
    // I can't really check args[1], as that's a PassThroughArgument I haven't seen.
    expect(args[2]).toBe("foo");
    expect(args[3]).toBe(3);
    expect(args.length).toBe(4);

    expect(spyInstanceReturn.spy).toHaveBeenCalledTimes(1);
  });

  it("creates an extended not-implemented component class", () => {
    const spyInstanceReturn = new SpyClass;
    spyInstanceReturn.spy.and.callFake(() => {
      return "I am a desert creature."
    });

    const instance = new EntryClass;

    {
      const config : ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["spy", spyInstanceReturn],
          ["throw", new ThrowClass],
        ]),
        sequences: new Map([
          ["sequence", ["throw", "spy"]],
        ]),
        startComponent: "sequence",
      };
      ComponentMap.override(instance, config);
    }

    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(spyInstanceReturn.spy).toHaveBeenCalledTimes(0);
  });

  it("creates an entry class which throws when there is no final answer", () => {
    const instance = new EntryClass;

    {
      const config : ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["continue", new ContinueClass],
        ]),
        sequences: new Map([
        ]),
        startComponent: "continue",
      };
      ComponentMap.override(instance, config);
    }

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("No resolved result!");
  });
});
