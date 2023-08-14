// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  LiteralTypedStructureImpl
} from "../../exports.mjs";

import type {
  ConditionalTypeStructureParts,
  ConditionalTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
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

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
ConditionalTypedStructureImpl satisfies CloneableStructure<ConditionalTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Conditional, ConditionalTypedStructureImpl);
