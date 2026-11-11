import type { CodeBlockWriter } from "ts-morph";

import {
  type AugmentedStructures,
  LiteralTypeStructureImpl,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_CHILDREN,
  WRITER_FUNCTION_KEY,
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
export class ConditionalTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Conditional> {
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
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    this.checkType.writerFunction(writer);
    writer.write(" extends ");
    this.extendsType.writerFunction(writer);
    writer.write(" ? ");
    this.trueType.writerFunction(writer);
    writer.write(" : ");
    this.falseType.writerFunction(writer);
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();

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
