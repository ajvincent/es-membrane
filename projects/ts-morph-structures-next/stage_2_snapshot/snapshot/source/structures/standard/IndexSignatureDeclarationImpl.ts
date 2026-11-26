//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import {
  COPY_FIELDS,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_CHILDREN,
} from "../../base/symbolKeys.js";
import { TypeAccessors } from "../../base/TypeAccessors.js";
import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
} from "../../decorators/standard/ReadonlyableNodeStructureMixin.js";
import {
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
} from "../../decorators/standard/ReturnTypedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type {
  AugmentedStructures,
  IndexSignatureDeclarationStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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

export class IndexSignatureDeclarationImpl
  extends IndexSignatureDeclarationStructureBase
  implements IndexSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.IndexSignature = StructureKind.IndexSignature;
  readonly #keyTypeAccessors: TypeAccessors;
  keyName?: string = undefined;
  // overridden in constructor
  keyType?: string | undefined = undefined;

  constructor() {
    super();
    // keyType is getting lost in ts-morph clone operations
    const keyTypeAccessors = new TypeAccessors();
    this.#keyTypeAccessors = keyTypeAccessors;

    Reflect.defineProperty(this, "keyType", {
      configurable: false,
      enumerable: true,

      get: function (): string | undefined {
        const type = keyTypeAccessors.type;
        return type !== undefined
          ? StructureBase[REPLACE_WRITER_WITH_STRING](type)
          : undefined;
      },

      set: function (value: string | undefined): void {
        keyTypeAccessors.type = value;
      },
    });
  }

  get keyTypeStructure(): TypeStructures | undefined {
    return this.#keyTypeAccessors.typeStructure;
  }

  set keyTypeStructure(value: TypeStructures | undefined) {
    this.#keyTypeAccessors.typeStructure = value;
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

  /**
   * Create a `IndexSignatureDeclarationImpl` from a `IndexSignatureDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<IndexSignatureDeclarationStructure>,
  ): IndexSignatureDeclarationImpl {
    const target = new IndexSignatureDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
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
