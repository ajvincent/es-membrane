import {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import TypeAccessors from "#stage_one/prototype-snapshot/base/TypeAccessors.js";

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
  WriterTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  getTypeStructureForCallback
} from "#stage_one/prototype-snapshot/base/callbackToTypeStructureRegistry.js";

describe("TypeAccessors with", () => {
  let manager: TypeAccessors;
  beforeEach(() => manager = new TypeAccessors);

  const literalTypeStructure = new LiteralTypedStructureImpl("NumberStringType");
  const stringTypeStructure = new StringTypedStructureImpl("NumberStringType");
  const writerTypeStructure = new WriterTypedStructureImpl(writer => writer.write("NumberStringType"));

  it("an undefined type and type structure", () => {
    expect(manager.type).toBe(undefined);
    expect(manager.typeStructure).toBe(undefined);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a string type", () => {
    manager.type = "NumberStringType";
    expect(manager.type).toBe("NumberStringType");
    expect(manager.typeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
    expect(
      (manager.typeStructure as LiteralTypedStructureImpl)?.stringValue
    ).toBe("NumberStringType");

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a WriterFunction type", () => {
    const callback: WriterFunction = (writer: CodeBlockWriter) => void(writer);
    manager.type = callback;

    expect(manager.type).toBe(callback);
    expect(manager.typeStructure).toBeInstanceOf(WriterTypedStructureImpl);
    expect(
      (manager.typeStructure as WriterTypedStructureImpl)?.writerFunction
    ).toBe(callback);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a string type structure", () => {
    manager.typeStructure = stringTypeStructure;

    expect(manager.type).toBe(stringTypeStructure.writerFunction);
    expect(manager.typeStructure).toBe(stringTypeStructure);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(typeof clone).toBe("function");

    if (typeof clone === "function") {
      const cloneTypeStructure = getTypeStructureForCallback(clone);
      expect(cloneTypeStructure).toBeInstanceOf(StringTypedStructureImpl);
      expect(cloneTypeStructure).not.toBe(stringTypeStructure);
      expect((cloneTypeStructure as StringTypedStructureImpl).stringValue).toBe(stringTypeStructure.stringValue);
    }
  });

  it("a literal type structure", () => {
    manager.typeStructure = literalTypeStructure;

    expect(manager.type).toBe("NumberStringType");
    expect(manager.typeStructure).toBe(literalTypeStructure);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a writer function type structure", () => {
    manager.typeStructure = writerTypeStructure;

    expect(manager.type).toBe(writerTypeStructure.writerFunction);
    expect(manager.typeStructure).toBe(writerTypeStructure);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });
});
