import type { NumberStringType } from "../fixtures/NumberStringType.mjs";
import type { ComponentPassThroughClass } from "../source/exports/PassThroughSupport.mjs";
import type { InstanceToComponentMap_Type } from "../source/exports/KeyToComponentMap_Base.mjs";
import type { Entry_BaseType } from "../source/exports/Common.mjs";

type PassThroughClassType = ComponentPassThroughClass<NumberStringType, NumberStringType>;
type PassThroughClassWithSpy = PassThroughClassType & { spy: jasmine.Spy };

describe("Component class generator", () => {
  // Required because a completely resolved URI at build time doesn't exist.
  async function getModuleDefault<U>(leafName: string) : Promise<{
    new() : U
  }>
  {
    return (await import("../spec-generated/component-classes/" + leafName)).default;
  }

  async function getModulePart<U>(leafName: string, property: string) : Promise<U> {
    return (await import("../spec-generated/component-classes/" + leafName))[property] as U;
  }

  let BaseClass: new () => NumberStringType;
  let SpyClass: new () => PassThroughClassWithSpy;
  let ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType>;
  let EntryClass: new () => NumberStringType;
  let ContinueClass: new () => PassThroughClassType;
  let ThrowClass: new () => PassThroughClassType;

  beforeAll(async () => {
    BaseClass = await getModuleDefault<NumberStringType>("BaseClass.mjs");
    SpyClass = await getModuleDefault<PassThroughClassWithSpy>("PassThrough_JasmineSpy.mjs");
    EntryClass = await getModuleDefault<Entry_BaseType<NumberStringType>>("EntryClass.mjs");
    ContinueClass = await getModuleDefault<PassThroughClassType>("PassThrough_Continue.mjs");
    ThrowClass = await getModuleDefault<PassThroughClassType>("PassThrough_NotImplemented.mjs");

    ComponentMap = await getModulePart<
      InstanceToComponentMap_Type<NumberStringType, NumberStringType>
    >("PassThroughClassType.mjs", "ComponentMap");
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

    const map = ComponentMap.override(instance, []);
    map.addComponent("spy", spyInstanceReturn);
    map.startComponent = "spy";

    const passThrough = map.buildPassThrough<
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
      const map = ComponentMap.override(instance, []);
      map.addComponent("spy", spyInstanceReturn);
      map.startComponent = "spy";
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
      const map = ComponentMap.override(instance, []);
      map.addComponent("spy", spyInstanceReturn);
      map.addComponent("continue", new ContinueClass);

      map.addSequence("sequence", ["continue", "spy"]);
      map.startComponent = "sequence";
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
      const map = ComponentMap.override(instance, [])
      map.addComponent("spy", spyInstanceReturn);
      map.addComponent("throw", new ThrowClass);

      map.addSequence("sequence", ["throw", "spy"]);
      map.startComponent = "sequence";
    }

    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(spyInstanceReturn.spy).toHaveBeenCalledTimes(0);
  });

  it("creates an entry class which throws when there is no final answer", () => {
    const instance = new EntryClass;
    {
      const map = ComponentMap.override(instance, []);
      map.addComponent("continue", new ContinueClass);
      map.startComponent = "continue";
    }

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("No resolved result!");
  });
});
