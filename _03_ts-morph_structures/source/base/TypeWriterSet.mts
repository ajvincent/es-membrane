import { WriterFunction } from "ts-morph";
import { TypeStructures } from "../typeStructures/TypeStructures.mjs";
import { getTypeStructureForCallback } from "./callbackToTypeStructureRegistry.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";

/**
 * This supports setting "implements" and "extends" types for arrays behind read-only array
 * proxies.  The goal is to manage type structures and writer functions in one place,
 * where direct array access is troublesome (particularly, "write access").
 *
 * In particular, if the user passes in a writer function belonging to a registered type structure,
 * this uses the type structure instead as the argument.
 */
export default class TypeWriterSet
extends Set<stringOrWriterFunction | TypeStructures>
{
  static #getStringOrWriterFunction(
    value: stringOrWriterFunction | TypeStructures
  ): stringOrWriterFunction
  {
    if ((typeof value === "string") || (typeof value === "function"))
      return value;
    return value.writerFunction;
  }

  static #getTypeWriterIfAvailable(
    value: WriterFunction
  ): WriterFunction | TypeStructures
  {
    return getTypeStructureForCallback(value) ?? value;
  }

  readonly #backingArray: stringOrWriterFunction[];

  /**
   * @param backingArray - The (non-proxied) array to update when changes happen.
   */
  constructor(backingArray: stringOrWriterFunction[]) {
    super();
    this.#backingArray = backingArray;
    backingArray.forEach((value: stringOrWriterFunction | TypeStructures) => {
      if (typeof value === "function") {
        value = TypeWriterSet.#getTypeWriterIfAvailable(value);
      }
      super.add(value);
    });
  }

  add(value: stringOrWriterFunction | TypeStructures): this
  {
    if (typeof value === "function") {
      value = TypeWriterSet.#getTypeWriterIfAvailable(value);
    }

    if (!super.has(value)) {
      this.#backingArray.push(TypeWriterSet.#getStringOrWriterFunction(value));
    }

    return super.add(value);
  }

  clear(): void {
    this.#backingArray.length = 0;
    return super.clear();
  }

  has(value: stringOrWriterFunction | TypeStructures): boolean {
    if (typeof value === "function") {
      value = TypeWriterSet.#getTypeWriterIfAvailable(value);
    }

    return super.has(value);
  }

  delete(value: stringOrWriterFunction | TypeStructures): boolean {
    if (typeof value === "function") {
      value = TypeWriterSet.#getTypeWriterIfAvailable(value);
    }

    if (!super.has(value))
      return false;

    const backingValue = TypeWriterSet.#getStringOrWriterFunction(value);
    this.#backingArray.splice(this.#backingArray.indexOf(backingValue), 1);

    return super.delete(value);
  }

  /**
   * Replace all the types this set managers with those from another array.
   * @param array - the types to add.
   */
  replaceFromArray(array: (stringOrWriterFunction | TypeStructures)[]): void {
    this.#backingArray.length = 0;
    super.clear();
    array.forEach(value => this.add(value));
  }
}
