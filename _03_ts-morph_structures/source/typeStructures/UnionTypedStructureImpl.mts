// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import {
  TypePrinter, TypePrinterSettingsBase
} from "../base/TypePrinter.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import type {
  TypeStructures,
  UnionTypedStructure
} from "./TypeStructures.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
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
      startToken: "",
      joinChildrenToken: " | ",
      endToken: "",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
UnionTypedStructureImpl satisfies CloneableStructure<UnionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Union, UnionTypedStructureImpl);
