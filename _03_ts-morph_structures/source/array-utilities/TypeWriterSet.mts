import { WriterFunction } from "ts-morph";
import { TypeStructure } from "../typeStructures/TypeStructure.mjs";
import { getTypeStructureForCallback } from "../typeStructures/callbackToTypeStructureRegistry.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";

/**
 * This supports setting "implements" types for arrays behind read-only array
 * proxies.  The goal is to manage type structures and writer functions in one place,
 * where direct array access is troublesome.
 */
export default class TypeWriterSet
extends Set<stringOrWriterFunction | TypeStructure>
{
  static #getStringOrWriterFunction(
    value: stringOrWriterFunction | TypeStructure
  ): stringOrWriterFunction
  {
    if ((typeof value === "string") || (typeof value === "function"))
      return value;
    return value.writerFunction;
  }

  static #getTypeWriterIfAvailable(
    value: WriterFunction
  ): WriterFunction | TypeStructure
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
    backingArray.forEach((value: stringOrWriterFunction | TypeStructure) => {
      if (typeof value === "function") {
        value = TypeWriterSet.#getTypeWriterIfAvailable(value) ?? value;
      }
      super.add(value)
    });
  }

  add(value: stringOrWriterFunction | TypeStructure): this
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

  has(value: stringOrWriterFunction | TypeStructure): boolean {
    if (typeof value === "function") {
      value = TypeWriterSet.#getTypeWriterIfAvailable(value);
    }

    return super.has(value);
  }

  delete(value: stringOrWriterFunction | TypeStructure): boolean {
    if (typeof value === "function") {
      value = TypeWriterSet.#getTypeWriterIfAvailable(value);
    }

    if (!super.has(value))
      return false;

    const backingValue = TypeWriterSet.#getStringOrWriterFunction(value);
    this.#backingArray.splice(this.#backingArray.indexOf(backingValue), 1);

    return super.delete(value);
  }
}
