import {
  type CodeBlockWriter,
  StructureKind,
  printStructure,
} from "ts-morph";

import {
  type AugmentedStructures,
  type JSDocImpl,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  StructureClassesMap,
  STRUCTURE_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
  WRITER_FUNCTION_KEY,
} from "../../../snapshot/source/internal-exports.js";

/** @example `[a: number]` */
export class NamedTupleMemberTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.NamedTupleMember> {
  public static clone(other: NamedTupleMemberTypeStructureImpl): NamedTupleMemberTypeStructureImpl {
    const namedTuple = new NamedTupleMemberTypeStructureImpl(other.name, TypeStructureClassesMap.clone(other.objectType));
    StructureClassesMap.cloneArrayWithKind(StructureKind.JSDoc, other.docs);
    namedTuple.hasDotDotDotToken = other.hasDotDotDotToken;
    namedTuple.hasQuestionToken = other.hasQuestionToken;
    return namedTuple;
  }

  public readonly kind: TypeStructureKind.NamedTupleMember = TypeStructureKind.NamedTupleMember;
  public readonly docs: JSDocImpl[] = [];
  public hasDotDotDotToken: boolean = false;
  public name: string;
  public hasQuestionToken: boolean = false;
  public objectType: TypeStructures;

  constructor(
    name: string,
    objectType: TypeStructures
  )
  {
    super();
    this.name = name;
    this.objectType = objectType;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    void writer;

    for (const doc of this.docs) {
      printStructure(doc, { indentNumberOfSpaces: writer.getIndentationLevel() * 2});
    }
    writer.conditionalWrite(this.hasDotDotDotToken, "...");
    writer.write(this.name);
    writer.conditionalWrite(this.hasQuestionToken, "?");
    writer.write(": ");
    this.objectType.writerFunction(writer);
  }

  /** @internal */
  public * [STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
    yield this.objectType;
  }
}
NamedTupleMemberTypeStructureImpl satisfies CloneableTypeStructure<NamedTupleMemberTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.NamedTupleMember, NamedTupleMemberTypeStructureImpl);
