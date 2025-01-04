// #region preamble
import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import { TypeStructureKind } from "../../exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../internal-exports.js";
// #endregion preamble

/** Strings, encased in double quotes.  Leaf nodes. */
export default class StringTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.String> {
  static readonly #cache = new Map<string, StringTypeStructureImpl>();

  /**
   * Gets a singleton `StringTypeStructureImpl` for the given name.
   */
  static get(name: string): StringTypeStructureImpl {
    if (!this.#cache.has(name)) {
      this.#cache.set(name, new StringTypeStructureImpl(name));
    }
    return this.#cache.get(name)!;
  }

  static clone(other: StringTypeStructureImpl): StringTypeStructureImpl {
    return StringTypeStructureImpl.get(other.stringValue);
  }

  readonly kind = TypeStructureKind.String;
  readonly stringValue: string;

  constructor(literal: string) {
    super();

    this.stringValue = literal;
    Reflect.defineProperty(this, "stringValue", {
      writable: false,
      configurable: false,
    });

    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void {
    writer.quote(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
StringTypeStructureImpl satisfies CloneableTypeStructure<StringTypeStructureImpl>;

TypeStructureClassesMap.set(TypeStructureKind.String, StringTypeStructureImpl);
