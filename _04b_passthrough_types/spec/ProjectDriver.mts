import type { NumberStringType } from "../fixtures/NumberStringType.mjs";
import type { ComponentPassThroughClass } from "../source/exports/internal/PassThroughSupport.mjs";
import type {
  InstanceToComponentMap_Type,
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

describe("Project Driver creates an EntryClass which", () => {
  const moduleSource: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/project/generated-base"
  };

  let EntryClass: new () => NumberStringType;
  let ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType>;
  let SpyClass: new () => PassThroughClassWithSpy;
  let spy: jasmine.Spy;

  beforeAll(async () => {
    EntryClass = await getModuleDefaultClass<Entry_BaseType<NumberStringType>>(moduleSource, "EntryClass.mjs");
    SpyClass = await getModuleDefaultClass<PassThroughClassWithSpy>(moduleSource, "PassThrough_JasmineSpy_WithReturn.mjs");

    ComponentMap = await getModulePart<
      InstanceToComponentMap_Type<NumberStringType, NumberStringType>
    >(moduleSource, "PassThroughClassType.mjs", "default");
  });

  let entry: NumberStringType;
  beforeEach(() => {
    entry = new EntryClass;
    spy = (ComponentMap.getComponent(entry, "_Spy") as unknown as { spy: jasmine.Spy }).spy;
  });

  afterEach(() => {
    spy.calls.reset();
    spy.and.callThrough();
  });

  it("defaults to the spy we supplied", () => {
    spy.and.returnValue("foo");
    expect(entry.repeatBack(3, "foo")).toBe("foo");
  });

  it("we can override components for a particular instance to a specific sequence", () => {
    spy.and.returnValue("bar");

    {
      const config: ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([]),
        sequences: new Map([
          ["ContinueToSpy", ["_Spy", "Continue"]]
        ]),
        startComponent: "ContinueToSpy",
      };
      ComponentMap.override(entry, config);
    }

    expect(entry.repeatForward("foo", 3)).toBe("bar");
  });

  it("we can insert components into", () => {
    spy.and.returnValue("bar");


    const secondSpy = new SpyClass;
    secondSpy.spy.and.returnValue("wop");

    {
      const config: ComponentMapOverride<NumberStringType, NumberStringType> = {
        components: new Map([
          ["Spy2", secondSpy]
        ]),
        sequences: new Map([
          ["ContinueToSpy", ["Continue", "Spy2"]]
        ]),
        startComponent: "ContinueToSpy",
      };
      ComponentMap.override(entry, config);
    }

    expect(entry.repeatForward("foo", 3)).toBe("wop");
  });
});

describe("Project Driver with optimized creates an EntryClass with three key components:", () => {
  const moduleSource: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated/project/generated-optimized"
  };

  let EntryClass: new () => NumberStringType;
  let ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType>;
  let SpyNoReturnClass: new () => PassThroughClassWithSpy;
  let SpyWithReturnClass: new () => PassThroughClassWithSpy;

  beforeAll(async () => {
    EntryClass = await getModuleDefaultClass<Entry_BaseType<NumberStringType>>(moduleSource, "EntryClass.mjs");
    SpyNoReturnClass = await getModuleDefaultClass<PassThroughClassWithSpy>(
      moduleSource, "PassThrough_JasmineSpy_NoReturn.mjs"
    );
    SpyWithReturnClass = await getModuleDefaultClass<PassThroughClassWithSpy>(
      moduleSource, "PassThrough_JasmineSpy_WithReturn.mjs"
    );

    ComponentMap = await getModulePart<
      InstanceToComponentMap_Type<NumberStringType, NumberStringType>
    >(moduleSource, "PassThroughClassType.mjs", "default");
  });

  it("three components will run", () => {
    expect(ComponentMap.defaultStart).toBe("main");
    {
      const keys = new Set(ComponentMap.defaultKeys);
      expect(keys.has("main")).toBe(true);
      expect(keys.has("body")).toBe(true);
      expect(keys.has("checkArguments")).toBe(true);
      expect(keys.has("checkReturn")).toBe(true);
      expect(keys.size).toBeGreaterThanOrEqual(4);
    }

    const instance = new EntryClass;

    const subkeys: ReadonlyArray<string> = [
      "checkArguments",
      "body",
      "checkReturn"
    ];

    {
      const sequence = ComponentMap.getSequence(instance, "main");
      expect(sequence).toEqual(subkeys);
    }

    const spies: jasmine.Spy[] = [];

    {
      const component = ComponentMap.getComponent(instance, "checkArguments");
      expect(component).toBeInstanceOf(SpyNoReturnClass);
      spies.push((component as PassThroughClassWithSpy).spy);
    }

    {
      const component = ComponentMap.getComponent(instance, "body");
      expect(component).toBeInstanceOf(SpyWithReturnClass);
      spies.push((component as PassThroughClassWithSpy).spy);
    }

    {
      const component = ComponentMap.getComponent(instance, "checkReturn");
      expect(component).toBeInstanceOf(SpyNoReturnClass);
      spies.push((component as PassThroughClassWithSpy).spy);
    }

    spies.forEach(spy => { spy.calls.reset(); spy.and.stub() });
    spies[1].and.returnValue("returnValue");
    const result = instance.repeatForward("foo", 3);

    expect(result).toBe("returnValue");
    spies.forEach(spy => {
      const args = spy.calls.argsFor(0);
      expect(args[0]).toBe("repeatForward");
      //expect(args[1]).toBe(passThrough);
      expect(args[1].entryPoint).toBe(instance);
      expect(args[2]).toBe("foo");
      expect(args[3]).toBe(3);
      expect(args.length).toBe(4);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    spies.forEach(spy => { spy.calls.reset(); spy.and.stub() });
  });
});
