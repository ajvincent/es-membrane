import type {
  CodeBlockWriter
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  TypeStructureKind,
  type TypeStructures,
  type stringOrWriterFunction,
} from "#stage_two/snapshot/source/exports.js";

import {
  TypeStructureSequence
} from "#stage_two/snapshot/source/base/TypeStructureSequence.js";

import {
  serializeWriter
} from "../../support/serializeWriter.js";

it("TypeStructureSequence correctly builds and maintains a proxy", () => {
  const neverArray: ArrayTypeStructureImpl = new ArrayTypeStructureImpl(
    LiteralTypeStructureImpl.get("never")
  );
  const structures: TypeStructures[] = [neverArray];
  const sequence: stringOrWriterFunction[] = TypeStructureSequence.createProxy(structures);

  const numWriter = (writer: CodeBlockWriter) => {
    writer.write("number");
  };

  sequence.push("ProxyHandler<never>", numWriter);

  expect(structures.length).toBe(3);
  expect(structures[0]).toBe(neverArray);

  expect(structures[1].kind).toBe(TypeStructureKind.TypeArgumented);
  if (structures[1].kind === TypeStructureKind.TypeArgumented) {
    expect(structures[1].objectType).toBe(LiteralTypeStructureImpl.get("ProxyHandler"));
    expect(structures[1].childTypes.length).toBe(1);
    expect(structures[1].childTypes[0]).toBe(LiteralTypeStructureImpl.get("never"));
  }

  expect(structures[2].kind).toBe(TypeStructureKind.Writer);
  if (structures[2].kind === TypeStructureKind.Writer) {
    expect(serializeWriter(structures[2].writerFunction)).toBe("number");
  }

  expect(sequence.length).toBe(3);
  expect(typeof sequence[0]).toBe("function");
  if (typeof sequence[0] === "function") {
    expect(serializeWriter(sequence[0])).toBe("never[]");
  }

  expect(typeof sequence[1]).toBe("function");
  if (typeof sequence[1] === "function") {
    expect(serializeWriter(sequence[1])).toBe("ProxyHandler<never>");
  }

  expect(typeof sequence[2]).toBe("function");
  if (typeof sequence[2] === "function") {
    expect(serializeWriter(sequence[2])).toBe("number");
  }
});
