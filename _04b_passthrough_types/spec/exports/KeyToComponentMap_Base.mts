import InstanceToComponentMap from "../../source/exports/KeyToComponentMap_Base.mjs";

import {
  NST_CONTINUE,
  NST_RESULT,
  NST_THROW,
} from "../../fixtures/first-mock/NST_INSTANCES.mjs";

import type {
  NumberStringType
} from "../../fixtures/NumberStringType.mjs";
import { PassThroughType } from "../../source/exports/PassThroughSupport.mjs";

const stubType0: NumberStringType =
{
  repeatForward(s, n) {
    void(s);
    void(n);
    return s.repeat(n);
  },
  repeatBack(n, s) {
    void(s);
    void(n);
    throw new Error("not implemented");
  }
};

const stubType1: NumberStringType =
{
  repeatForward(s, n) {
    void(s);
    void(n);
    throw new Error("not implemented");
  },
  repeatBack(n, s) {
    void(s);
    void(n);
    throw new Error("not implemented");
  }
};

describe("InstanceToComponentMap", () => {
  let map: InstanceToComponentMap<NumberStringType, NumberStringType>;
  beforeEach(() => map = new InstanceToComponentMap);

  it("instances are frozen", () => {
    expect(Object.isFrozen(map)).toBe(true);
  });

  it("shows default keys and inserted components", () => {
    expect(Array.from(map.defaultKeys)).toEqual([]);

    map.addDefaultComponent("continue", NST_CONTINUE);
    expect(Array.from(map.defaultKeys)).toEqual(["continue"]);
    expect(map.getComponent(stubType0, "continue")).toBe(NST_CONTINUE);

    map.addDefaultComponent("throw", NST_THROW);
    expect(Array.from(map.defaultKeys)).toEqual(["continue", "throw"]);
    expect(map.getComponent(stubType0, "continue")).toBe(NST_CONTINUE);
    expect(map.getComponent(stubType0, "throw")).toBe(NST_THROW);

    map.addDefaultComponent("result", NST_RESULT);
    expect(Array.from(map.defaultKeys)).toEqual([
      "continue", "throw", "result"
    ]);
    expect(map.getComponent(stubType0, "continue")).toBe(NST_CONTINUE);
    expect(map.getComponent(stubType0, "throw")).toBe(NST_THROW);
    expect(map.getComponent(stubType0, "result")).toBe(NST_RESULT);
  });

  it(".override() hides components except for those we defined", () => {
    map.addDefaultComponent("continue", NST_CONTINUE);
    map.addDefaultComponent("result", NST_THROW);

    const submap = map.override(stubType1, ["continue"]);
    expect(Array.from(submap.keys)).toEqual(["continue"]);
    expect(submap.getComponent("continue")).toBe(NST_CONTINUE);

    submap.addComponent("result", NST_RESULT);
    expect(Array.from(submap.keys)).toEqual(["continue", "result"]);
    expect(submap.getComponent("result")).toBe(NST_RESULT);

    expect(map.getComponent(stubType0, "continue")).toBe(NST_CONTINUE);
    expect(map.getComponent(stubType0, "result")).toBe(NST_THROW);

    expect(map.getComponent(stubType1, "continue")).toBe(NST_CONTINUE);
    expect(map.getComponent(stubType1, "result")).toBe(NST_RESULT);
  });

  it("allows setting a start component after the component is defined", () => {
    expect(map.defaultStart).toBe(undefined);

    map.addDefaultComponent("continue", NST_CONTINUE);
    expect(map.defaultStart).toBe(undefined);

    map.defaultStart = "continue";
    expect(map.defaultStart).toBe("continue");
  });

  it("allows setting a sequence", () => {
    map.addDefaultComponent("continue", NST_CONTINUE);
    map.addDefaultComponent("result", NST_THROW);

    map.addDefaultSequence("continueAndResult", ["continue", "result"]);
    expect(map.getSequence(stubType0, "continueAndResult")).toEqual(["continue", "result"]);

    expect(map.defaultKeys).toEqual(
      ["continue", "result", "continueAndResult"]
    );
  });

  it(".override() lets you copy keys in a sequence when one of the subkeys is not copied", () => {
    map.addDefaultComponent("continue", NST_CONTINUE);
    map.addDefaultComponent("result", NST_THROW);

    map.addDefaultSequence("continueAndResult", ["continue", "result"]);

    const submap = map.override(stubType1, ["continue", "continueAndResult"]);
    expect(Array.from(submap.keys)).toEqual(["continue", "continueAndResult"]);
    expect(submap.getComponent("continue")).toBe(NST_CONTINUE);

    expect(submap.getSequence("continueAndResult")).toEqual(["continue", "result"]);
  });

  function passThrough() : PassThroughType<NumberStringType, NumberStringType["repeatForward"], NumberStringType>
  {
    return map.buildPassThrough<NumberStringType["repeatForward"]>(
      stubType0,
      "repeatForward",
      ["foo", 3]
    );
  }

  describe(".buildPassThrough() creates a runnable pass-through argument which returns", () => {
    it("[false, undefined] on calling .getReturnValue() without calling .setReturnValue()", () => {
      const successPass = passThrough();
      expect(successPass.getReturnValue()).toEqual([false, undefined]);
    });

    it("[true, string] on calling .getReturnValue() without calling .setReturnValue()", () => {
      const successPass = passThrough();
      successPass.setReturnValue("foo")
      expect(successPass.getReturnValue()).toEqual([true, "foo"]);
    });

    it("a definite result on a component name", () => {
      map.addDefaultComponent("result", NST_RESULT);
      const successPass = passThrough();

      successPass.callTarget("result");
      expect(successPass.getReturnValue()).toEqual([true, "foofoofoo"]);
      expect(successPass.entryPoint).toBe(stubType0);
    });

    it("void on a component name", () => {
      map.addDefaultComponent("continue", NST_CONTINUE);
      const successPass = passThrough();

      successPass.callTarget("continue");
      expect(successPass.getReturnValue()).toEqual([false, undefined]);
      expect(successPass.entryPoint).toBe(stubType0);
    });

    it("a definite result on a sequence name", () => {
      map.addDefaultComponent("continue", NST_CONTINUE);
      map.addDefaultComponent("result", NST_RESULT);

      map.addDefaultSequence("sequence", ["continue", "result"]);
      const successPass = passThrough();

      successPass.callTarget("sequence");
      expect(successPass.getReturnValue()).toEqual([true, "foofoofoo"]);
      expect(successPass.entryPoint).toBe(stubType0);
    });

    it("void on a sequence name", () => {
      map.addDefaultComponent("continue1", NST_CONTINUE);
      map.addDefaultComponent("continue2", NST_CONTINUE);

      map.addDefaultSequence("sequence", ["continue1", "continue2"]);
      const successPass = passThrough();

      successPass.callTarget("sequence");
      expect(successPass.getReturnValue()).toEqual([false, undefined]);
      expect(successPass.entryPoint).toBe(stubType0);
    });
  });

  describe("throws for trying to", () => {
    it("define a component twice", () => {
      map.addDefaultComponent("continue", NST_CONTINUE);
      expect(
        () => map.addDefaultComponent("continue", NST_CONTINUE)
      ).toThrowError("Key is already defined!");
    });

    it("retrieve an undefined component", () => {
      expect(
        () => map.getComponent(stubType0, "continue")
      ).toThrowError("No component match!");
    });

    it("define a component with a previously-defined sequence name", () => {
      map.addDefaultComponent("continue", NST_CONTINUE);
      map.addDefaultComponent("throw", NST_THROW);
      map.addDefaultComponent("result", NST_RESULT);
      map.addDefaultSequence("sequence", ["continue", "throw", "result"]);

      expect(
        () => map.addDefaultComponent("sequence", NST_CONTINUE)
      ).toThrowError("Key is already defined!");
    });

    describe("set the start component", () => {
      it("to undefined", () => {
        expect(
          () => map.defaultStart = undefined
        ).toThrowError("Start component must be a non-empty string or a symbol!");
      });

      it("to an empty string", () => {
        expect(
          () => map.defaultStart = ""
        ).toThrowError("key cannot be an empty string!");
      });

      it("to a key we haven't defined yet", () => {
        expect(
          () => map.defaultStart = "continue"
        ).toThrowError("You haven't registered the start component yet!");
      });

      it("after we've successfully set it", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.defaultStart = "continue";
        expect(
          () => map.defaultStart = "continue"
        ).toThrowError("This map already has a start component!");
      });
    });

    describe("set a sequence with", () => {
      it("the same top name as an existing component", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.addDefaultComponent("throw", NST_THROW);
        map.addDefaultComponent("result", NST_RESULT);
        expect(
          () => map.addDefaultSequence("continue", ["throw", "result"])
        ).toThrowError("The top key is already in the map!");
      });

      it("the same top name as a previous sequence", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.addDefaultComponent("throw", NST_THROW);
        map.addDefaultComponent("result", NST_RESULT);
        map.addDefaultSequence("sequence", ["continue", "throw", "result"]);
        expect(
          () => map.addDefaultSequence("sequence", ["continue", "throw", "result"])
        ).toThrowError("The top key is already in the map!");
      });

      it("less than two sequence keys", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.addDefaultComponent("result", NST_THROW);

        expect(
          () => map.addDefaultSequence("sequence", [])
        ).toThrowError("There must be at least two subkeys!");

        expect(
          () => map.addDefaultSequence("sequence", ["continue"])
        ).toThrowError("There must be at least two subkeys!");
      });

      it("the top key among the sequence keys", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.addDefaultComponent("result", NST_THROW);

        expect(
          () => map.addDefaultSequence("sequence", [
            "continue", "throw", "sequence"
          ])
        ).toThrowError("Top key cannot be among the subkeys!");
      });

      it("a sequence key repeated twice", () => {
        map.addDefaultComponent("continue", NST_CONTINUE);
        map.addDefaultComponent("result", NST_THROW);

        expect(
          () => map.addDefaultSequence("sequence", [
            "continue", "throw", "continue"
          ])
        ).toThrowError("Duplicate key among the subkeys!");
      });
    });

    it("run a pass-through's callTarget() with a specific component key twice", () => {
      map.addDefaultComponent("result", NST_RESULT);
      const successPass = passThrough();

      successPass.callTarget("result");
      expect(
        () => successPass.callTarget("result")
      ).toThrowError(`Visited target "result"!`);
    });

    it("set a pass-through's return argument twice", () => {
      const successPass = passThrough();
      successPass.setReturnValue("foo");
      expect(() => {
        successPass.setReturnValue("foo");
      }).toThrowError("There is already a return value here!");
    });
  });
});
