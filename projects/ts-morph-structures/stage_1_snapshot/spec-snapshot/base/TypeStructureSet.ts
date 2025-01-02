import { CodeBlockWriter } from "ts-morph";

import TypeStructureSet from "#stage_one/prototype-snapshot/base/TypeStructureSet.js";

import {
  stringOrWriterFunction
} from "#stage_one/prototype-snapshot/types/ts-morph-native.js";

import {
  LiteralTypedStructureImpl
} from "#stage_one/prototype-snapshot/exports.js";

describe("TypeStructureSet", () => {
  let backingArray: stringOrWriterFunction[];
  let writerSet: TypeStructureSet;
  beforeEach(() => {
    backingArray = [];
    writerSet = new TypeStructureSet(backingArray);
  });

  it("starts out empty", () => {
    expect(writerSet.size).toBe(0);
  })

  it("tracks strings as strings", () => {
    writerSet.add("boolean");
    expect(backingArray.includes("boolean")).toBe(true);
    expect(backingArray.length).toBe(1);

    expect(writerSet.size).toBe(1);
    expect(writerSet.has("boolean")).toBe(true);
    expect(Array.from(writerSet)).toEqual(["boolean"]);

    expect(writerSet.delete("boolean")).toBe(true);
    expect(writerSet.has("boolean")).toBe(false);
    expect(writerSet.size).toBe(0);
    expect(Array.from(writerSet)).toEqual([]);

    expect(writerSet.delete("boolean")).toBe(false);
    expect(writerSet.has("boolean")).toBe(false);
    expect(writerSet.size).toBe(0);
    expect(Array.from(writerSet)).toEqual([]);

    writerSet.add("object");
    writerSet.add("boolean");
    writerSet.add("void");
    writerSet.add("object");

    // preserving ordering test
    expect(Array.from(writerSet)).toEqual(["object", "boolean", "void"]);
    expect(backingArray).toEqual(["object", "boolean", "void"]);
  });

  it("tracks writer functions not from type structures as themselves", () => {
    let called = false;
    function writerOne(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }

    function writerTwo(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }

    writerSet.add("boolean");
    writerSet.add(writerOne);
    expect(backingArray).toEqual(["boolean", writerOne]);

    expect(writerSet.size).toBe(2);
    expect(writerSet.has(writerOne)).toBe(true);
    expect(Array.from(writerSet)).toEqual(["boolean", writerOne]);

    expect(writerSet.delete(writerOne)).toBe(true);
    expect(writerSet.has(writerOne)).toBe(false);
    expect(writerSet.size).toBe(1);
    expect(Array.from(writerSet)).toEqual(["boolean"]);
    expect(backingArray).toEqual(["boolean"]);

    expect(writerSet.delete(writerOne)).toBe(false);
    expect(writerSet.has(writerOne)).toBe(false);
    expect(writerSet.size).toBe(1);
    expect(Array.from(writerSet)).toEqual(["boolean"]);
    expect(backingArray).toEqual(["boolean"]);

    writerSet.add(writerOne);
    writerSet.add("string");
    writerSet.add(writerTwo);
    writerSet.add(writerOne);
    expect(writerSet.size).toBe(4);
    expect(backingArray).toEqual([
      "boolean", writerOne, "string", writerTwo
    ]);
    expect(Array.from(writerSet)).toEqual([
      "boolean", writerOne, "string", writerTwo
    ]);

    expect(called).toBe(false);
  });

  it("tracks type structures as themselves", () => {
    const literalString = new LiteralTypedStructureImpl("string");
    const literalNumber = new LiteralTypedStructureImpl("number");

    writerSet.add("boolean");
    writerSet.add(literalString);
    expect(backingArray).toEqual(["boolean", literalString.writerFunction]);
    expect(writerSet.has("boolean")).toBe(true);
    expect(writerSet.has(literalString)).toBe(true);
    expect(writerSet.has(literalString.writerFunction)).toBe(true);
    expect(writerSet.size).toBe(2);

    writerSet.add(literalNumber.writerFunction);
    expect(backingArray).toEqual([
      "boolean",
      literalString.writerFunction,
      literalNumber.writerFunction,
    ]);
    expect(writerSet.has(literalNumber)).toBe(true);
    expect(writerSet.has(literalNumber.writerFunction)).toBe(true);
    expect(writerSet.size).toBe(3);
    expect(Array.from(writerSet)).toEqual([
      "boolean", literalString, literalNumber
    ]);

    writerSet.delete(literalString.writerFunction);
    expect(writerSet.has(literalString)).toBe(false);
    expect(writerSet.has(literalString.writerFunction)).toBe(false);
    expect(writerSet.size).toBe(2);
    expect(backingArray).toEqual([
      "boolean", literalNumber.writerFunction
    ]);
    expect(Array.from(writerSet)).toEqual([
      "boolean", literalNumber
    ]);

    writerSet.add(literalString);
    writerSet.delete(literalNumber.writerFunction);
    expect(writerSet.has(literalNumber)).toBe(false);
    expect(writerSet.has(literalNumber.writerFunction)).toBe(false);
    expect(writerSet.size).toBe(2);
    expect(backingArray).toEqual([
      "boolean", literalString.writerFunction
    ]);
    expect(Array.from(writerSet)).toEqual([
      "boolean", literalString
    ]);
  });

  it("initializes with existing values", () => {
    let called = false;
    function writerOne(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }
    const literalString = new LiteralTypedStructureImpl("string");
    backingArray.push("boolean", writerOne, literalString.writerFunction);

    writerSet = new TypeStructureSet(backingArray);
    expect(writerSet.size).toBe(3);
    expect(Array.from(writerSet)).toEqual([
      "boolean", writerOne, literalString
    ]);
    expect(backingArray).toEqual([
      "boolean", writerOne, literalString.writerFunction
    ]);
    expect(called).toBe(false);
  });

  it(".clear clears the backing array as well", () => {
    let called = false;
    function writerOne(writer: CodeBlockWriter): void {
      called = true;
      void(writer);
    }
    const literalString = new LiteralTypedStructureImpl("string");
    backingArray.push("boolean", writerOne, literalString.writerFunction);

    writerSet = new TypeStructureSet(backingArray);

    writerSet.clear();
    expect(backingArray).toEqual([]);
    expect(writerSet.size).toBe(0);
    expect(Array.from(writerSet).length).toBe(0);
    expect(called).toBe(false);
  });
});
