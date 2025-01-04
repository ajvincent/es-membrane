// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import type {
  TypeStructures,
  UnionTypedStructure
} from "./TypeStructures.js";

import {
  TypePrinter, TypePrinterSettingsBase
} from "../base/TypePrinter.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #endregion

/** Foo | Bar | ... */
export default class UnionTypedStructureImpl
implements UnionTypedStructure
{
  static clone(
    other: UnionTypedStructure
  ): UnionTypedStructure
  {
    return new UnionTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  public readonly kind: TypeStructureKind.Union = TypeStructureKind.Union;
  childTypes: TypeStructures[] = [];
  readonly printSettings = new TypePrinterSettingsBase;

  constructor(
    childTypes: TypeStructures[] = []
  )
  {
    this.appendStructures(childTypes);
    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    for (let i = 0; i < this.childTypes.length; i++) {
      replaceDescendantTypeStructures(this.childTypes, i, filter, replacement);
    }
  }

  public appendStructures(
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
      startToken: "",
      joinChildrenToken: " | ",
      endToken: "",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
UnionTypedStructureImpl satisfies CloneableStructure<UnionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Union, UnionTypedStructureImpl);
