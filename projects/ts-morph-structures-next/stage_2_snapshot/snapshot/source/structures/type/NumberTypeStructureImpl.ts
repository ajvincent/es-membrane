// #region preamble
import type { CodeBlockWriter } from "ts-morph";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import TypeStructuresBase from "./TypeStructuresBase.js";

// #endregion preamble

/**
 * Numbers (boolean, number, string, void, etc.), without quotes, brackets, or
 * anything else around them.  Leaf nodes.
 */
export class NumberTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Number> {
  static readonly #cache = new Map<number, NumberTypeStructureImpl>();

  /**
   * Gets a singleton `NumberTypeStructureImpl` for the given name.
   */
  static get(name: number): NumberTypeStructureImpl {
    if (!this.#cache.has(name)) {
      this.#cache.set(name, new NumberTypeStructureImpl(name));
    }
    return this.#cache.get(name)!;
  }

  static clone(other: NumberTypeStructureImpl): NumberTypeStructureImpl {
    return NumberTypeStructureImpl.get(other.numberValue);
  }

  readonly kind = TypeStructureKind.Number;
  readonly numberValue: number;

  constructor(value: number) {
    super();

    this.numberValue = value;
    Reflect.defineProperty(this, "numberValue", {
      writable: false,
      configurable: false,
    });
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    writer.write(this.numberValue.toString());
  }
}
NumberTypeStructureImpl satisfies CloneableTypeStructure<NumberTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Number, NumberTypeStructureImpl);
