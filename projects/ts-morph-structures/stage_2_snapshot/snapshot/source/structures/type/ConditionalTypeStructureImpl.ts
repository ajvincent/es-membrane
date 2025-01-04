import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import {
  LiteralTypeStructureImpl,
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
} from "../../internal-exports.js";

export interface ConditionalTypeStructureParts {
  checkType: TypeStructures;
  extendsType: TypeStructures;
  trueType: TypeStructures;
  falseType: TypeStructures;
}

/** `checkType` extends `extendsType` ? `trueType` : `falseType` */
export default class ConditionalTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Conditional> {
  public static clone(
    other: ConditionalTypeStructureImpl,
  ): ConditionalTypeStructureImpl {
    const parts: ConditionalTypeStructureParts = {
      checkType: TypeStructureClassesMap.clone(other.checkType),
      extendsType: TypeStructureClassesMap.clone(other.extendsType),
      trueType: TypeStructureClassesMap.clone(other.trueType),
      falseType: TypeStructureClassesMap.clone(other.falseType),
    };

    return new ConditionalTypeStructureImpl(parts);
  }

  readonly kind = TypeStructureKind.Conditional;
  public checkType: TypeStructures;
  public extendsType: TypeStructures;
  public trueType: TypeStructures;
  public falseType: TypeStructures;

  constructor(conditionalParts: Partial<ConditionalTypeStructureParts>) {
    super();

    this.checkType =
      conditionalParts.checkType ?? LiteralTypeStructureImpl.get("never");
    this.extendsType =
      conditionalParts.extendsType ?? LiteralTypeStructureImpl.get("never");
    this.trueType =
      conditionalParts.trueType ?? LiteralTypeStructureImpl.get("never");
    this.falseType =
      conditionalParts.falseType ?? LiteralTypeStructureImpl.get("never");

    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void {
    this.checkType.writerFunction(writer);
    writer.write(" extends ");
    this.extendsType.writerFunction(writer);
    writer.write(" ? ");
    this.trueType.writerFunction(writer);
    writer.write(" : ");
    this.falseType.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();

    if (typeof this.checkType === "object") yield this.checkType;
    if (typeof this.extendsType === "object") yield this.extendsType;
    if (typeof this.trueType === "object") yield this.trueType;
    if (typeof this.falseType === "object") yield this.falseType;
  }
}
ConditionalTypeStructureImpl satisfies CloneableTypeStructure<ConditionalTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Conditional,
  ConditionalTypeStructureImpl,
);
