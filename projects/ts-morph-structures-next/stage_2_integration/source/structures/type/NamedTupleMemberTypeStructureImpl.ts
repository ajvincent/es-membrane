import {
  type CodeBlockWriter,
  StructureKind,
  type WriterFunction,
  printStructure,
} from "ts-morph";

import {
  type JSDocImpl,
  TypeStructureKind,
  type StructureImpls,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  StructureClassesMap,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
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
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void {
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

  public readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public * [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures> {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.objectType;
  }
}
NamedTupleMemberTypeStructureImpl satisfies CloneableTypeStructure<NamedTupleMemberTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.NamedTupleMember, NamedTupleMemberTypeStructureImpl);
