import {
  StructureKind,
  type CodeBlockWriter,
  type WriterFunction,
} from "ts-morph";

import {
  ImportAttributeImpl,
  /*
  // ReferenceError: Cannot access 'LiteralTypeStructureImpl' before initialization
  LiteralTypeStructureImpl,
  */
  QualifiedNameTypeStructureImpl,
  StringTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeStructureKind,
  type StructureImpls,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructuresBase,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
} from "../../../snapshot/source/internal-exports.js";

import {
  LiteralTypeStructureImpl
} from "./LiteralTypeStructureImpl.js";

import StructureClassesMap from "../../base/StructureClassesMap.js";

/** @example `import("ts-morph", { with: { "resolution-mode": "import" } }).StatementStructures` */
export class ImportTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Import>
{
  // not using LiteralTypeStructureImpl.get() to avoid caching this
  static readonly #nullIdentifier = new LiteralTypeStructureImpl("");

  readonly #typeArguments: TypeArgumentedTypeStructureImpl;

  argument: StringTypeStructureImpl;

  readonly kind: TypeStructureKind.Import = TypeStructureKind.Import;
  readonly attributes: ImportAttributeImpl[];
  readonly childTypes: TypeStructures[];

  constructor(
    argument: StringTypeStructureImpl,
    attributes: ImportAttributeImpl[],
    qualifier: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null,
    typeArguments: TypeStructures[]
  )
  {
    super();
    this.argument = argument;
    this.attributes = attributes.map(attr => ImportAttributeImpl.clone(attr));

    typeArguments = typeArguments.slice();
    this.#typeArguments = new TypeArgumentedTypeStructureImpl(
      qualifier ?? ImportTypeStructureImpl.#nullIdentifier,
      typeArguments
    );

    this.childTypes = typeArguments;
  }

  get qualifier(): LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null
  {
    if (this.#typeArguments.objectType === ImportTypeStructureImpl.#nullIdentifier)
      return null;
    return this.#typeArguments.objectType as LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl;
  }
  set qualifier(
    value: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null
  )
  {
    this.#typeArguments.objectType = value ?? ImportTypeStructureImpl.#nullIdentifier;
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    ImportTypeStructureImpl.pairedWrite(writer, "import(", ")", false, false, () => {
      this.argument.writerFunction(writer);
      if (this.attributes.length) {
        writer.write(", ");

        writer.inlineBlock(() => {
          writer.write("with: ");
          writer.inlineBlock(() => {
            let isFirst: boolean = true;
            for (const attr of this.attributes) {
              if (isFirst === false) {
                writer.write(",");
              }
              writer.quote(attr.name);
              writer.write(": ");
              writer.quote(attr.value);
              isFirst = false;
            }
          });
        });
      }
    });
    if (this.qualifier) {
      writer.write(".");
      this.#typeArguments.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();

    yield this.argument;
    yield * this.attributes;

    const qualifier = this.qualifier;
    if (qualifier)
      yield qualifier;

    yield* this.childTypes;
  }

  public static clone(
    other: ImportTypeStructureImpl
  ): ImportTypeStructureImpl
  {
    let { qualifier } = other;
    if (qualifier?.kind === TypeStructureKind.Literal) {
      qualifier = LiteralTypeStructureImpl.clone(qualifier);
    }
    else if (qualifier?.kind === TypeStructureKind.QualifiedName) {
      qualifier = QualifiedNameTypeStructureImpl.clone(qualifier);
    }

    return new ImportTypeStructureImpl(
      other.argument,
      StructureClassesMap.cloneArrayWithKind(StructureKind.ImportAttribute, other.attributes),
      qualifier,
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }
}
ImportTypeStructureImpl satisfies CloneableTypeStructure<ImportTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Import, ImportTypeStructureImpl);
