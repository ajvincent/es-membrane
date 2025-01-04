// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  LiteralTypedStructureImpl
} from "../exports.js";

import type {
  ConditionalTypeStructureParts,
  ConditionalTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

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
// #endregion preamble

/** `checkType` extends `extendsType` ? `trueType` : `falseType` */
export default class ConditionalTypedStructureImpl
implements ConditionalTypedStructure
{
  static #buildNever(): LiteralTypedStructureImpl
  {
    return new LiteralTypedStructureImpl("never");
  }

  static #clonePart(childType: TypeStructures): TypeStructures
  {
    return TypeStructureClassesMap.clone(childType);
  }

  public static clone(
    other: ConditionalTypedStructure
  ): ConditionalTypedStructureImpl
  {
    const parts: ConditionalTypeStructureParts = {
      checkType: this.#clonePart(other.checkType),
      extendsType: this.#clonePart(other.extendsType),
      trueType: this.#clonePart(other.trueType),
      falseType: this.#clonePart(other.falseType),
    };

    return new ConditionalTypedStructureImpl(parts);
  }

  readonly kind: TypeStructureKind.Conditional = TypeStructureKind.Conditional;
  checkType: TypeStructures;
  extendsType: TypeStructures;
  trueType: TypeStructures;
  falseType: TypeStructures;

  constructor(
    conditionalParts: Partial<ConditionalTypeStructureParts>
  )
  {
    this.checkType = conditionalParts.checkType ?? ConditionalTypedStructureImpl.#buildNever();
    this.extendsType = conditionalParts.extendsType ?? ConditionalTypedStructureImpl.#buildNever();
    this.trueType = conditionalParts.trueType ?? ConditionalTypedStructureImpl.#buildNever();
    this.falseType = conditionalParts.falseType ?? ConditionalTypedStructureImpl.#buildNever();

    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this, "checkType", filter, replacement);
    replaceDescendantTypeStructures(this, "extendsType", filter, replacement);
    replaceDescendantTypeStructures(this, "trueType", filter, replacement);
    replaceDescendantTypeStructures(this, "falseType", filter, replacement);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    this.checkType.writerFunction(writer);
    writer.write(" extends ");
    this.extendsType.writerFunction(writer);
    writer.write(" ? ");
    this.trueType.writerFunction(writer);
    writer.write(" : ");
    this.falseType.writerFunction(writer);
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
ConditionalTypedStructureImpl satisfies CloneableStructure<ConditionalTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Conditional, ConditionalTypedStructureImpl);
