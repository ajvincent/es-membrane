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

import TypeStructuresBase from "../base/TypeStructuresBase.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
// #endregion preamble

/** `checkType` extends `extendsType` ? `trueType` : `falseType` */
export default class ConditionalTypedStructureImpl
extends TypeStructuresBase
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
    super();
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

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();

    if (typeof this.checkType === "object")
      yield this.checkType;
    if (typeof this.extendsType === "object")
      yield this.extendsType;
    if (typeof this.trueType === "object")
      yield this.trueType;
    if (typeof this.falseType === "object")
      yield this.falseType;
  }
}
ConditionalTypedStructureImpl satisfies CloneableStructure<ConditionalTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Conditional, ConditionalTypedStructureImpl);
