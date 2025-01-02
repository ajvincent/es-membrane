//#region preamble
import type {
  IndexSignatureDeclarationStructureClassIfc,
  StructureImpls,
  TypeStructures,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  TypeAccessors,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type IndexSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const IndexSignatureDeclarationStructureBase = MultiMixinBuilder<
  [
    ReadonlyableNodeStructureFields,
    ReturnTypedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ReadonlyableNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class IndexSignatureDeclarationImpl
  extends IndexSignatureDeclarationStructureBase
  implements IndexSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.IndexSignature = StructureKind.IndexSignature;
  readonly #keyTypeManager = new TypeAccessors();
  keyName?: string = undefined;

  get keyType(): string | undefined {
    const type = this.#keyTypeManager.type;
    return type ? StructureBase[REPLACE_WRITER_WITH_STRING](type) : undefined;
  }

  set keyType(value: string | undefined) {
    this.#keyTypeManager.type = value;
  }

  get keyTypeStructure(): TypeStructures | undefined {
    return this.#keyTypeManager.typeStructure;
  }

  set keyTypeStructure(value: TypeStructures | undefined) {
    this.#keyTypeManager.typeStructure = value;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<IndexSignatureDeclarationStructure>,
    target: IndexSignatureDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.keyName) {
      target.keyName = source.keyName;
    }

    const { keyTypeStructure } =
      source as unknown as IndexSignatureDeclarationImpl;
    if (keyTypeStructure) {
      target.keyTypeStructure = TypeStructureClassesMap.clone(keyTypeStructure);
    } else if (source.keyType) {
      target.keyType = source.keyType;
    }
  }

  public static clone(
    source: OptionalKind<IndexSignatureDeclarationStructure>,
  ): IndexSignatureDeclarationImpl {
    const target = new IndexSignatureDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.keyTypeStructure === "object") yield this.keyTypeStructure;
  }

  public toJSON(): StructureClassToJSON<IndexSignatureDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<IndexSignatureDeclarationImpl>;
    if (this.keyName) {
      rv.keyName = this.keyName;
    } else {
      rv.keyName = undefined;
    }

    if (this.keyType) {
      rv.keyType = this.keyType;
    } else {
      rv.keyType = undefined;
    }

    rv.kind = this.kind;
    return rv;
  }
}

IndexSignatureDeclarationImpl satisfies CloneableStructure<
  IndexSignatureDeclarationStructure,
  IndexSignatureDeclarationImpl
> &
  Class<ExtractStructure<IndexSignatureDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.IndexSignature,
  IndexSignatureDeclarationImpl,
);
