// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  TypeStructureKind,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../../snapshot/source/internal-exports.js";
// #endregion preamble

/**
 * Numbers (boolean, number, string, void, etc.), without quotes, brackets, or
 * anything else around them.  Leaf nodes.
 */
export default class NumberTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.Number>
{
  static readonly #cache = new Map<number, NumberTypeStructureImpl>;

  /**
   * Gets a singleton `NumberTypeStructureImpl` for the given name.
   */
  static get(
    name: number
  ): NumberTypeStructureImpl
  {
    if (!this.#cache.has(name)) {
      this.#cache.set(name, new NumberTypeStructureImpl(name));
    }
    return this.#cache.get(name)!;
  }

  static clone(
    other: NumberTypeStructureImpl
  ): NumberTypeStructureImpl
  {
    return NumberTypeStructureImpl.get(other.numberValue);
  }

  readonly kind = TypeStructureKind.Number;
  readonly numberValue: number;

  constructor(value: number)
  {
    super();

    this.numberValue = value;
    Reflect.defineProperty(this, "numberValue", {
      writable: false,
      configurable: false
    });

    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.numberValue.toString());
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
NumberTypeStructureImpl satisfies CloneableTypeStructure<NumberTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Number, NumberTypeStructureImpl);
