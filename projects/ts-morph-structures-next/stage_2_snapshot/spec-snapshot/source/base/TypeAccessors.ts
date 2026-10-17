import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  StringTypeStructureImpl,
  WriterTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  TypeAccessors,
  TypeStructuresBase,
} from "#stage_two/snapshot/source/internal-exports.js";

import {
  serializeWriter
} from "../../support/serializeWriter.js";

describe("TypeAccessors with", () => {
  let manager: TypeAccessors;
  beforeEach(() => manager = new TypeAccessors);

  const stringTypeStructure = new StringTypeStructureImpl("NumberStringType");
  const writerTypeStructure = new WriterTypeStructureImpl(writer => writer.write("NumberStringType"));

  it("an undefined type and type structure", () => {
    expect(manager.type).toBe(undefined);
    expect(manager.typeStructure).toBe(undefined);

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a string type", () => {
    manager.type = "NumberStringType";
    expect(manager.type).toBe("NumberStringType");
    expect(manager.typeStructure).toBe(LiteralTypeStructureImpl.get("NumberStringType"));

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).toBe(manager.type);
  });

  it("a WriterFunction type", () => {
    const callback: WriterFunction = (writer: CodeBlockWriter) => writer.write("Dog");
    manager.type = callback;

    expect(manager.typeStructure).toBeInstanceOf(WriterTypeStructureImpl);
    expect(serializeWriter(manager.type)).toBe("Dog");

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
      const cloneTypeStructure = TypeStructuresBase.getWriterStructureForCallback(clone);
      expect(cloneTypeStructure).toBeInstanceOf(StringTypeStructureImpl);
      expect(cloneTypeStructure).not.toBe(stringTypeStructure);
      expect((cloneTypeStructure as StringTypeStructureImpl).stringValue).toBe(stringTypeStructure.stringValue);
    }
  });

  it("a writer function type structure", () => {
    manager.typeStructure = writerTypeStructure;

    expect(manager.type).withContext("manager.type").toBe(writerTypeStructure.writerFunction);
    expect(manager.typeStructure).toBe(writerTypeStructure);

    if (manager.type === writerTypeStructure.writerFunction) {
      expect(serializeWriter(manager.type)).toBe("NumberStringType");
    }

    const clone = TypeAccessors.cloneType(manager.type);
    expect(clone).withContext("clone").not.toBe(manager.type);

    expect(typeof clone).toBe("function");
    if (typeof clone === "function") {
      expect(serializeWriter(clone)).toBe("NumberStringType");
    }
  });
});
