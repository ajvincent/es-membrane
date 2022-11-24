//const specGeneratedDir = path.resolve(url.fileURLToPath(import.meta.url), "../../spec-generated");

import { NumberStringType } from "../fixtures/NumberStringType.mjs";
import {
  IsTypedNST,
  NST_Keys,
  NumberStringAndIllegal,
  NumberStringAndType,
  NumberStringConditional,
  NumberStringExcludesBar,
  NumberStringFoo,
  UnionArgument,
  SymbolTypeKey,
  NumberStringAndSymbol,
} from "../fixtures/TypePatterns.mjs";

describe("TypeToClass supports", () => {
  // Required because a completely resolved URI at build time doesn't exist.
  async function getModuleDefault<T extends unknown[], U>(leafName: string) : Promise<{
    new(__args__?: T) : U
  }>
  {
    return (await import("../spec-generated/" + leafName)).default;
  }

  it("type alias to literal", async () => {
    const NSTC = await getModuleDefault<[], NumberStringType>("NumberStringTypeClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it("interface split across two declarations", async () => {
    const NSTC = await getModuleDefault<[], NumberStringType>("NumberStringInterfaceClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it(`properties of a type as "not implemented" getter`, async () => {
    const TypedClass = await getModuleDefault<[], IsTypedNST>("IsTypedNST.mjs");
    expect(Reflect.ownKeys(TypedClass.prototype)).toEqual([
      "constructor",
      "type",
    ]);

    const instance = new TypedClass;
    expect(
      () => instance.type
    ).toThrowError("not yet implemented");
  });

  it(`multiple types on implementation`, async () => {
    const TypedClass = await getModuleDefault<[], NumberStringAndType>("NumberStringWithTypeClass.mjs");
    expect(Reflect.ownKeys(TypedClass.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
      "type",
    ]);

    const instance = new TypedClass;

    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");

    expect(
      () => instance.type
    ).toThrowError("not yet implemented");
  });

  it("partial type implementation", async () => {
    const NSTC = await getModuleDefault<
      [], Pick<NumberStringType, "repeatForward">
    >("NumberStringPartial.mjs");

    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");
  });

  it("imported & re-exported type", async () => {
    const NSTC = await getModuleDefault<[], NumberStringType>("StringNumberTypeClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it(`properties of a type which the constructor defines`, async () => {
    const TypedClass = await getModuleDefault<[], IsTypedNST>("IsTypedNSTWithConstructor.mjs");
    expect(Reflect.ownKeys(TypedClass.prototype)).toEqual([
      "constructor",
    ]);

    const instance = new TypedClass;
    expect(Reflect.ownKeys(instance)).toEqual([
      "type"
    ]);
    expect(instance.type).toBe("foo");
  });

  it(`intersection of a referenced type`, async () => {
    const TypedClass = await getModuleDefault<[], NumberStringAndType>("NumberStringAndTypeClass.mjs");
    expect(Reflect.ownKeys(TypedClass.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
      "type",
    ]);

    const instance = new TypedClass;

    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");

    expect(
      () => instance.type
    ).toThrowError("not yet implemented");
  });

  it(`extended interfaces`, async () => {
    const TypedClass = await getModuleDefault<[], NumberStringFoo>("FooExtendsNumberString.mjs");
    expect(Reflect.ownKeys(TypedClass.prototype)).toEqual([
      "constructor",
      "repeatFoo",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new TypedClass;

    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatFoo(3)
    ).toThrowError("not yet implemented");
  });

  it("never key in type", async () => {
    const NSTC = await getModuleDefault<[], NumberStringAndIllegal>("NumberStringAndIllegal.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
      "illegal"
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");

    expect(
      () => instance.illegal
    ).toThrowError("not yet implemented");
  });

  it("union in arguments of a method", async () => {
    const NSTC = await getModuleDefault<[], UnionArgument>("UnionArgumentClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "doSomething"
    ]);

    const instance = new NSTC;
    expect(
      () => instance.doSomething("foo")
    ).toThrowError("not yet implemented");
  });

  it("parameterized type", async () => {
    const NSTC = await getModuleDefault<[], NumberStringExcludesBar>("NumberStringExcludesBarClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it("mapped type", async () => {
    const NSTC = await getModuleDefault<[], NST_Keys>("NST_Keys_Class.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack
    ).toThrowError("not yet implemented");
  });

  it("conditional type", async () => {
    const NumberStringClass = await getModuleDefault<
      [], NumberStringConditional
    >("NumberStringConditionalClass.mjs");

    expect(Reflect.ownKeys(NumberStringClass.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
    ]);

    const instance = new NumberStringClass;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");
  });

  it("symbol key in type", async () => {
    const NSTC = await getModuleDefault<[], NumberStringAndSymbol>("NumberStringAndSymbolClass.mjs");
    expect(Reflect.ownKeys(NSTC.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack",
      SymbolTypeKey,
    ]);

    const instance = new NSTC;
    expect(
      () => instance.repeatForward("foo", 3)
    ).toThrowError("not yet implemented");

    expect(
      () => instance.repeatBack(3, "foo")
    ).toThrowError("not yet implemented");

    expect(
      () => instance[SymbolTypeKey]
    ).toThrowError("not yet implemented");
  });

  it("custom statements in methods, and extra class fields", async () => {
    const NSTC = await getModuleDefault<
      [], NumberStringType & { spy: jasmine.Spy }
    >("JasmineSpyClass.mjs");

    const instance = new NSTC;
    expect(instance.repeatForward("foo", 3)).toBe("foofoofoo");

    expect(instance.spy).toHaveBeenCalledOnceWith("foo", 3);
    expect(instance.spy.calls.thisFor(0)).toBe(instance);
  });
});
