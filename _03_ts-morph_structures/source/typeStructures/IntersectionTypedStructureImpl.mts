// #region preamble
import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  TypePrinter,
  TypePrinterSettingsBase,
} from "../base/TypePrinter.mjs";

import type {
  IntersectionTypedStructure,
  TypeStructures
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/** Foo & Bar & ... */
export default class IntersectionTypedStructureImpl
implements IntersectionTypedStructure
{
  static clone(
    other: IntersectionTypedStructure
  ): IntersectionTypedStructureImpl
  {
    return new IntersectionTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  public readonly kind: TypeStructureKind.Intersection = TypeStructureKind.Intersection;

  childTypes: TypeStructures[] = [];
  readonly printSettings = new TypePrinterSettingsBase;

  constructor(
    childTypes: TypeStructures[] = [],
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
      joinChildrenToken: " & ",
      endToken: "",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
IntersectionTypedStructureImpl satisfies CloneableStructure<IntersectionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Intersection, IntersectionTypedStructureImpl);
