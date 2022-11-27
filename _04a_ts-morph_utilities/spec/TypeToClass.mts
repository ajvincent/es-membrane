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

import {
  getModuleDefaultClass,
  ModuleSourceDirectory
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

describe("TypeToClass supports", () => {
  const moduleSource: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated"
  };

  it("type alias to literal", async () => {
    const NSTC = await getModuleDefaultClass<NumberStringType>(moduleSource, "NumberStringTypeClass.mjs");
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
    const NSTC = await getModuleDefaultClass<NumberStringType>(moduleSource, "NumberStringInterfaceClass.mjs");
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
    const TypedClass = await getModuleDefaultClass<IsTypedNST>(moduleSource, "IsTypedNST.mjs");
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
    const TypedClass = await getModuleDefaultClass<NumberStringAndType>(moduleSource, "NumberStringWithTypeClass.mjs");
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
    const NSTC = await getModuleDefaultClass<
      Pick<NumberStringType, "repeatForward">
    >(moduleSource, "NumberStringPartial.mjs");

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
    const NSTC = await getModuleDefaultClass<NumberStringType>(moduleSource, "StringNumberTypeClass.mjs");
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
    const TypedClass = await getModuleDefaultClass<IsTypedNST>(moduleSource, "IsTypedNSTWithConstructor.mjs");
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
    const TypedClass = await getModuleDefaultClass<NumberStringAndType>(moduleSource, "NumberStringAndTypeClass.mjs");
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
    const TypedClass = await getModuleDefaultClass<NumberStringFoo>(moduleSource, "FooExtendsNumberString.mjs");
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
    const NSTC = await getModuleDefaultClass<NumberStringAndIllegal>(moduleSource, "NumberStringAndIllegal.mjs");
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
    const NSTC = await getModuleDefaultClass<UnionArgument>(moduleSource, "UnionArgumentClass.mjs");
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
    const NSTC = await getModuleDefaultClass<NumberStringExcludesBar>(moduleSource, "NumberStringExcludesBarClass.mjs");
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
    const NSTC = await getModuleDefaultClass<NST_Keys>(moduleSource, "NST_Keys_Class.mjs");
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
    const NumberStringClass = await getModuleDefaultClass<
      NumberStringConditional
    >(moduleSource, "NumberStringConditionalClass.mjs");

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
    const NSTC = await getModuleDefaultClass<NumberStringAndSymbol>(moduleSource, "NumberStringAndSymbolClass.mjs");
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
    const NSTC = await getModuleDefaultClass<
      NumberStringType & { spy: jasmine.Spy }
    >(moduleSource, "JasmineSpyClass.mjs");

    const instance = new NSTC;
    expect(instance.repeatForward("foo", 3)).toBe("foofoofoo");

    expect(instance.spy).toHaveBeenCalledOnceWith("foo", 3);
    expect(instance.spy.calls.thisFor(0)).toBe(instance);
  });
});
