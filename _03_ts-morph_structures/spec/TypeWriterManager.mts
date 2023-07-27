import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";
import TypeWriterManager from "../source/base/TypeWriterManager.mjs";
import {
  LiteralTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";

describe("TypeWriterManager with", () => {
  let manager: TypeWriterManager;
  beforeEach(() => manager = new TypeWriterManager);

  const typeStructure = new LiteralTypedStructureImpl("NumberStringType");

  it("an undefined type and type structure", () => {
    expect(manager.type).toBe(undefined);
    expect(manager.typeStructure).toBe(undefined);
  });

  it("a string type", () => {
    manager.type = "NumberStringType";
    expect(manager.typeStructure).toBe(undefined);
    expect(manager.type).toBe("NumberStringType");
  });

  it("a WriterFunction type", () => {
    const callback: WriterFunction = (writer: CodeBlockWriter) => void(writer);
    manager.type = callback;
    expect(manager.typeStructure).toBe(undefined);
    expect(manager.type).toBe(callback);
  });

  it("an actual type structure", () => {
    manager.typeStructure = typeStructure;

    expect(manager.type).toBe(typeStructure.writerFunction);
    expect(manager.typeStructure).toBe(typeStructure);
  });

  it("a WriterFunction from a known type structure", () => {
    manager.type = typeStructure.writerFunction;

    expect(manager.typeStructure).toBe(typeStructure);
    expect(manager.type).toBe(typeStructure.writerFunction);
  });
});
