// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  ParenthesesTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypePrinter,
  TypePrinterSettingsBase,
} from "../base/TypePrinter.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/** Wrap the child type in parentheses. */
export default class ParenthesesTypedStructureImpl
implements ParenthesesTypedStructure
{
  public static clone(
    other: ParenthesesTypedStructure
  ): ParenthesesTypedStructureImpl
  {
    return new ParenthesesTypedStructureImpl(
      TypeStructureClassesMap.clone(other.childTypes[0])
    );
  }

  readonly kind: TypeStructureKind.Parentheses = TypeStructureKind.Parentheses;
  childTypes: [TypeStructures];

  constructor(childType: TypeStructures)
  {
    this.childTypes = [childType];

    registerCallbackForTypeStructure(this);
  }

  readonly printSettings = new TypePrinterSettingsBase;

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this.childTypes, 0, filter, replacement);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    TypePrinter(
      writer,
      {
        ...this.printSettings,
        objectType: null,
        startToken: "(",
        childTypes: this.childTypes,
        joinChildrenToken: "",
        endToken: ")",
      }
    );
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
ParenthesesTypedStructureImpl satisfies CloneableStructure<ParenthesesTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Parentheses, ParenthesesTypedStructureImpl);
