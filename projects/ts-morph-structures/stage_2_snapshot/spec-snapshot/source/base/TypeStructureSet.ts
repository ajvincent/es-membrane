import {
  CodeBlockWriter
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  StringTypeStructureImpl,
  type TypeStructureSet,
  WriterTypeStructureImpl,
  type stringOrWriterFunction,
} from "#stage_two/snapshot/source/exports.js";

import {
  TypeStructureSetInternal,
} from "#stage_two/snapshot/source/internal-exports.js";

describe("TypeStructureSet", () => {
  let backingArray: stringOrWriterFunction[];
  let writerSet: TypeStructureSet;
  beforeEach(() => {
    backingArray = [];
    writerSet = new TypeStructureSetInternal(backingArray);
  });

  it("starts out empty", () => {
    expect(writerSet.size).toBe(0);
  })

  it("tracks type structures as themselves", () => {
    const stringFoo = new StringTypeStructureImpl("foo");
    const stringBar = new StringTypeStructureImpl("bar");

    writerSet.add(LiteralTypeStructureImpl.get("boolean"));
    writerSet.add(stringFoo);
    expect(backingArray).toEqual(["boolean", stringFoo.writerFunction]);
    expect(writerSet.has(LiteralTypeStructureImpl.get("boolean"))).toBe(true);
    expect(writerSet.has(stringFoo)).toBe(true);
    expect(writerSet.size).toBe(2);

    writerSet.add(stringBar);
    expect(backingArray).toEqual([
      "boolean",
      stringFoo.writerFunction,
      stringBar.writerFunction,
    ]);
    expect(writerSet.has(stringBar)).toBe(true);
    expect(writerSet.size).toBe(3);
    expect(Array.from(writerSet)).toEqual([
      LiteralTypeStructureImpl.get("boolean"), stringFoo, stringBar
    ]);

    writerSet.delete(stringFoo);
    expect(writerSet.has(stringFoo)).toBe(false);
    expect(writerSet.size).toBe(2);
    expect(backingArray).toEqual([
      "boolean", stringBar.writerFunction
    ]);
    expect(Array.from(writerSet)).toEqual([
      LiteralTypeStructureImpl.get("boolean"), stringBar
    ]);

    writerSet.add(stringFoo);
    writerSet.delete(stringBar);
    expect(writerSet.has(stringBar)).toBe(false);
    expect(writerSet.size).toBe(2);
    expect(backingArray).toEqual([
      "boolean", stringFoo.writerFunction
    ]);
    expect(Array.from(writerSet)).toEqual([
      LiteralTypeStructureImpl.get("boolean"), stringFoo
    ]);
  });

  it("initializes with existing values", () => {
    let called = false;
    function writerOne(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }
    const stringFoo = new StringTypeStructureImpl("foo");
    backingArray.push("boolean", writerOne, stringFoo.writerFunction);

    writerSet = new TypeStructureSetInternal(backingArray);
    expect(writerSet.size).toBe(3);
    const writerArray = Array.from(writerSet);
    expect(writerArray[1]).toBeInstanceOf(WriterTypeStructureImpl);
    expect((writerArray[1] as WriterTypeStructureImpl).writerFunction).toBe(writerOne);

    writerArray.splice(1, 1);
    expect(writerArray).toEqual([
      LiteralTypeStructureImpl.get("boolean"), stringFoo
    ]);

    expect(backingArray).toEqual([
      "boolean", writerOne, stringFoo.writerFunction
    ]);
    expect(called).toBe(false);
  });

  it(".clear clears the backing array as well", () => {
    let called = false;
    function writerOne(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }
    const stringFoo = new StringTypeStructureImpl("foo");
    backingArray.push("boolean", writerOne, stringFoo.writerFunction);

    writerSet = new TypeStructureSetInternal(backingArray);

    writerSet.clear();
    expect(backingArray).toEqual([]);
    expect(writerSet.size).toBe(0);
    expect(Array.from(writerSet).length).toBe(0);
    expect(called).toBe(false);
  });
});
