import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  ConditionalTypeStructureParts,
  ConditionalTypedStructure,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";

import LiteralTypedStructureImpl from "./LiteralTypedStructureImpl.mjs";

export default class ConditionalTypedStructureImpl
implements ConditionalTypedStructure
{
  static #buildNever(): LiteralTypedStructureImpl
  {
    return new LiteralTypedStructureImpl("never");
  }

  static #clonePart(childType: TypeStructure): TypeStructure
  {
    return cloneableClassesMap.get(childType.kind)!.clone(childType);
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
  checkType: TypeStructure;
  extendsType: TypeStructure;
  trueType: TypeStructure;
  falseType: TypeStructure;

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

cloneableClassesMap.set(TypeStructureKind.Conditional, ConditionalTypedStructureImpl);
