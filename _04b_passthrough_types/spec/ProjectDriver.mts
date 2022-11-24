import type { NumberStringType } from "../fixtures/NumberStringType.mjs";
import type { ComponentPassThroughClass } from "../source/exports/PassThroughSupport.mjs";
import type { InstanceToComponentMap_Type } from "../source/exports/KeyToComponentMap_Base.mjs";
import type { Entry_BaseType } from "../source/exports/Common.mjs";

type PassThroughClassType = ComponentPassThroughClass<NumberStringType, NumberStringType>;
type PassThroughClassWithSpy = PassThroughClassType & { spy: jasmine.Spy };

describe("Project Driver creates an EntryClass which", () => {
  // Required because a completely resolved URI at build time doesn't exist.
  async function getModuleDefault<U>(leafName: string) : Promise<{
    new() : U
  }>
  {
    return (await import("../spec-generated/project/generated-base/" + leafName)).default;
  }

  async function getModulePart<U>(leafName: string, property: string) : Promise<U> {
    return (await import("../spec-generated/project/generated-base/" + leafName))[property] as U;
  }

  let EntryClass: new () => NumberStringType;
  let ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType>;
  let SpyClass: new () => PassThroughClassWithSpy;
  let spy: jasmine.Spy;

  beforeAll(async () => {
    EntryClass = await getModuleDefault<Entry_BaseType<NumberStringType>>("EntryClass.mjs");

    SpyClass = await getModuleDefault<PassThroughClassWithSpy>("PassThrough_JasmineSpy.mjs");

    ComponentMap = await getModulePart<
      InstanceToComponentMap_Type<NumberStringType, NumberStringType>
    >("PassThroughClassType.mjs", "ComponentMap");
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

    const map = ComponentMap.override(entry, ["_Spy", "Continue", "ContinueToSpy"]);
    map.startComponent = "ContinueToSpy";
    expect(entry.repeatForward("foo", 3)).toBe("bar");
  });

  it("we can insert components into", () => {
    spy.and.returnValue("bar");

    const map = ComponentMap.override(entry, ["Continue"]);

    const secondSpy = new SpyClass;
    secondSpy.spy.and.returnValue("wop");

    map.addComponent("Spy2", secondSpy);
    map.addSequence("ContinueToSpy", ["Continue", "Spy2"]);
    map.startComponent = "ContinueToSpy";

    expect(entry.repeatForward("foo", 3)).toBe("wop");
  });
});

describe("Project Driver with optimized creates an EntryClass with three key components:", () => {
  // Required because a completely resolved URI at build time doesn't exist.
  async function getModuleDefault<U>(leafName: string) : Promise<{
    new() : U
  }>
  {
    return (await import("../spec-generated/project/generated-optimized/" + leafName)).default;
  }

  async function getModulePart<U>(leafName: string, property: string) : Promise<U> {
    return (await import("../spec-generated/project/generated-optimized/" + leafName))[property] as U;
  }

  let EntryClass: new () => NumberStringType;
  let ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType>;
  let SpyClass: new () => PassThroughClassWithSpy;

  beforeAll(async () => {
    EntryClass = await getModuleDefault<Entry_BaseType<NumberStringType>>("EntryClass.mjs");

    SpyClass = await getModuleDefault<PassThroughClassWithSpy>("PassThrough_JasmineSpy.mjs");

    ComponentMap = await getModulePart<
      InstanceToComponentMap_Type<NumberStringType, NumberStringType>
    >("PassThroughClassType.mjs", "ComponentMap");
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

    subkeys.forEach(subkey => {
      const component = ComponentMap.getComponent(instance, subkey);
      expect(component).toBeInstanceOf(SpyClass);
    });

    /*
    instance.repeatForward("foo", 3);
    */
  });
});
