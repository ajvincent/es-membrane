// #region preamble
import type {
  TupleTypedStructure,
  TypeStructures
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import { TypePrinter, TypePrinterSettingsBase } from "../base/TypePrinter.mjs";
import { CodeBlockWriter, WriterFunction } from "ts-morph";
// #endregion preamble

/**
 * `[number, boolean]`
 *
 * @see `ArrayTypedStructureImpl` for `boolean[]`
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 */
export default class TupleTypedStructureImpl
implements TupleTypedStructure
{
  static clone(
    other: TupleTypedStructure
  ): TupleTypedStructureImpl
  {
    return new TupleTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind: TypeStructureKind.Tuple = TypeStructureKind.Tuple;
  childTypes: TypeStructures[] = [];
  readonly printSettings = new TypePrinterSettingsBase;

  constructor(
    childTypes: TypeStructures[] = [],
  )
  {
    this.appendStructures(childTypes);
    registerCallbackForTypeStructure(this);
  }

  appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.childTypes.push(...structuresContext);
    return this;
  }

  #writerFunction(writer: CodeBlockWriter): void {
    TypePrinter(writer, {
      ...this.printSettings,
      objectType: null,
      childTypes: this.childTypes,
      startToken: "[",
      joinChildrenToken: ", ",
      endToken: "]",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
TupleTypedStructureImpl satisfies CloneableStructure<TupleTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Tuple, TupleTypedStructureImpl);
