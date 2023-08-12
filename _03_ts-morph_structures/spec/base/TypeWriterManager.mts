import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import TypeWriterManager from "../../source/base/TypeWriterManager.mjs";

import {
  LiteralTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";

import {
  getTypeStructureForCallback
} from "#ts-morph_structures/source/base/callbackToTypeStructureRegistry.mjs";

describe("TypeWriterManager with", () => {
  let manager: TypeWriterManager;
  beforeEach(() => manager = new TypeWriterManager);

  const typeStructure = new LiteralTypedStructureImpl("NumberStringType");

  it("an undefined type and type structure", () => {
    expect(manager.type).toBe(undefined);
    expect(manager.typeStructure).toBe(undefined);

    const clone = TypeWriterManager.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a string type", () => {
    manager.type = "NumberStringType";
    expect(manager.typeStructure).toBe(undefined);
    expect(manager.type).toBe("NumberStringType");

    const clone = TypeWriterManager.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a WriterFunction type", () => {
    const callback: WriterFunction = (writer: CodeBlockWriter) => void(writer);
    manager.type = callback;
    expect(manager.typeStructure).toBe(undefined);
    expect(manager.type).toBe(callback);

    const clone = TypeWriterManager.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("an actual type structure", () => {
    manager.typeStructure = typeStructure;

    expect(manager.type).toBe(typeStructure.writerFunction);
    expect(manager.typeStructure).toBe(typeStructure);

    const clone = TypeWriterManager.cloneType(manager.type);
    expect(typeof clone).toBe("function");

    if (typeof clone === "function") {
      const cloneTypeStructure = getTypeStructureForCallback(clone);
      expect(cloneTypeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
      expect(cloneTypeStructure).not.toBe(typeStructure);
      expect((cloneTypeStructure as LiteralTypedStructureImpl).stringValue).toBe(typeStructure.stringValue);
    }
  });

  it("a WriterFunction from a known type structure", () => {
    manager.type = typeStructure.writerFunction;

    expect(manager.typeStructure).toBe(typeStructure);
    expect(manager.type).toBe(typeStructure.writerFunction);

    const clone = TypeWriterManager.cloneType(manager.type);
    expect(typeof clone).toBe("function");

    if (typeof clone === "function") {
      const cloneTypeStructure = getTypeStructureForCallback(clone);
      expect(cloneTypeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
      expect(cloneTypeStructure).not.toBe(typeStructure);
      expect((cloneTypeStructure as LiteralTypedStructureImpl).stringValue).toBe(typeStructure.stringValue);
    }
  });
});
