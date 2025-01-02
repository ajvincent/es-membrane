import type {
  CodeBlockWriter,
  ImplementsClauseableNodeStructure
} from 'ts-morph'

import TypeStructureSet from "#stage_one/prototype-snapshot/base/TypeStructureSet.js";
import ReadonlyArrayProxyHandler from "#stage_one/prototype-snapshot/array-utilities/ReadonlyArrayProxyHandler.js";
import type {
  stringOrWriterFunction
} from "#stage_one/prototype-snapshot/types/ts-morph-native.js";
import {
  LiteralTypedStructureImpl,
  TypeStructures,
} from "#stage_one/prototype-snapshot/exports.js";

it("ts-morph structures: implements array and set, integration test", () => {
  class ImplementsArrayOwner implements Required<ImplementsClauseableNodeStructure>
  {
    static readonly #implementsArrayProxyHandler = new ReadonlyArrayProxyHandler<stringOrWriterFunction>(
      "Use the implementsAsSet property."
    );
    readonly #implementsArray: stringOrWriterFunction[] = [];
    readonly #implementsArrayProxy = new Proxy(
      this.#implementsArray,
      ImplementsArrayOwner.#implementsArrayProxyHandler,
    );
    readonly #implementsArrayAsSet = new TypeStructureSet(this.#implementsArray);

    get implements(): stringOrWriterFunction[] {
      return this.#implementsArrayProxy;
    }

    get implementsAsSet(): Set<stringOrWriterFunction | TypeStructures> {
      return this.#implementsArrayAsSet;
    }
  }

  let called = false;
  function writerOne(writer: CodeBlockWriter): void {
    called = true;
    void(writer);
  }

  const owner = new ImplementsArrayOwner;

  expect(Array.isArray(owner.implements)).toBe(true);
  expect(owner.implementsAsSet).toBeInstanceOf(Set);
  expect(owner.implements).toEqual([]);
  expect(owner.implementsAsSet.size).toBe(0);

  expect(() => {
    owner.implements.push("boolean");
  }).toThrowError("Use the implementsAsSet property.");
  expect(owner.implements).toEqual([]);
  expect(owner.implementsAsSet.size).toBe(0);

  expect(() => owner.implementsAsSet.add("boolean")).not.toThrowError();
  expect(owner.implements).toEqual(["boolean"]);
  expect(owner.implementsAsSet.size).toBe(1);
  expect(owner.implementsAsSet.has("boolean")).toBe(true);

  const literal = new LiteralTypedStructureImpl("NumberStringType");
  owner.implementsAsSet.add(literal);
  expect(owner.implements).toEqual([
    "boolean", literal.writerFunction
  ]);
  expect(Array.from(owner.implementsAsSet)).toEqual([
    "boolean", literal
  ]);

  owner.implementsAsSet.add("boolean");
  expect(owner.implements).toEqual([
    "boolean", literal.writerFunction
  ]);
  expect(Array.from(owner.implementsAsSet)).toEqual([
    "boolean", literal
  ]);

  owner.implementsAsSet.add(writerOne);
  expect(owner.implements).toEqual([
    "boolean", literal.writerFunction, writerOne
  ]);
  expect(Array.from(owner.implementsAsSet)).toEqual([
    "boolean", literal, writerOne
  ]);
  expect(called).toBe(false);

  owner.implementsAsSet.delete(literal);
  expect(owner.implements).toEqual([
    "boolean", writerOne
  ]);
  expect(Array.from(owner.implementsAsSet)).toEqual([
    "boolean", writerOne
  ]);

  owner.implementsAsSet.clear();
  expect(owner.implements).toEqual([]);
  expect(Array.from(owner.implementsAsSet)).toEqual([]);
  expect(called).toBe(false);
});
