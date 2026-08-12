import type { WriterFunction } from "ts-morph";

import {
  TypeStructureKind,
  TypeStructures,
  LiteralTypeStructureImpl,
  WriterTypeStructureImpl,
  type stringOrWriterFunction,
} from "../exports.js";

import {
  TypeStructuresBase,
  TypeStructureClassesMap,
} from "../internal-exports.js";

/** @public */
export interface TypeStructureSet extends Set<TypeStructures> {
  /**
   * Replace all the types this set manages with those from another array.
   * @param array - the types to add.
   */
  replaceFromTypeArray(array: (string | WriterFunction)[]): void;

  /**
   * Replace all the type structures this set managers with those from another set.
   * @param other - the type structure set to copy
   */
  cloneFromTypeStructureSet(other: TypeStructureSet): void;
}

/**
 * This supports setting "implements" and "extends" types for arrays behind read-only array
 * proxies.  The goal is to manage type structures and writer functions in one place,
 * where direct array access is troublesome (particularly, "write access").
 *
 * @internal
 */
export default class TypeStructureSetInternal
  extends Set<TypeStructures>
  implements TypeStructureSet
{
  static #getBackingValue(value: TypeStructures): stringOrWriterFunction {
    return value.kind === TypeStructureKind.Literal
      ? value.stringValue
      : value.writerFunction;
  }

  readonly #backingArray: Pick<
    stringOrWriterFunction[],
    "indexOf" | "length" | "push" | "splice"
  >;

  /**
   * @param backingArray - The (non-proxied) array to update when changes happen.
   */
  constructor(backingArray: stringOrWriterFunction[]) {
    super();
    this.#backingArray = backingArray;

    for (const value of backingArray) {
      if (typeof value === "string") {
        super.add(LiteralTypeStructureImpl.get(value));
        continue;
      }

      const typeStructure =
        TypeStructuresBase.getTypeStructureForCallback(value) ??
        new WriterTypeStructureImpl(value);
      super.add(typeStructure);
    }
  }

  add(value: TypeStructures): this {
    if (!super.has(value)) {
      this.#backingArray.push(TypeStructureSetInternal.#getBackingValue(value));
    }

    return super.add(value);
  }

  clear(): void {
    this.#backingArray.length = 0;
    return super.clear();
  }

  delete(value: TypeStructures): boolean {
    const backingValue = TypeStructureSetInternal.#getBackingValue(value);
    const index = this.#backingArray.indexOf(backingValue);
    if (index === -1) {
      return false;
    }

    this.#backingArray.splice(index, 1);
    return super.delete(value);
  }

  /**
   * Replace all the types this set managers with those from another array.
   * @param array - the types to add.
   */
  replaceFromTypeArray(array: (string | WriterFunction)[]): void {
    this.clear();
    array.forEach((value) => {
      if (typeof value === "string") {
        this.add(LiteralTypeStructureImpl.get(value));
        return;
      }

      const structure: TypeStructures =
        TypeStructuresBase.getTypeStructureForCallback(value) ??
        new WriterTypeStructureImpl(value);
      this.add(structure);
    });
  }

  /**
   * Replace all the type structures this set managers with those from another set.
   * @param other - the type structure set to copy
   */
  cloneFromTypeStructureSet(other: TypeStructureSet): void {
    this.clear();
    other.forEach((value) => {
      if (typeof value === "string") this.add(value);
      else this.add(TypeStructureClassesMap.clone(value));
    });
  }
}
