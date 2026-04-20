//#region preamble
import type {
  stringOrWriterFunction,
  StructureImpls,
  TypeAliasDeclarationStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  TypeAccessors,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const TypeAliasDeclarationStructureBase = MultiMixinBuilder<
  [
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    TypeParameteredNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class TypeAliasDeclarationImpl
  extends TypeAliasDeclarationStructureBase
  implements TypeAliasDeclarationStructureClassIfc
{
  readonly kind: StructureKind.TypeAlias = StructureKind.TypeAlias;
  readonly #typeManager: TypeAccessors;
  // overridden in constructor
  type: stringOrWriterFunction;

  constructor(name: string, type: stringOrWriterFunction) {
    super();
    // type is getting lost in ts-morph clone operations
    this.#typeManager = TypeAccessors.buildTypeAccessors(this, "type", "");
    this.name = name;
    this.type = type;
  }

  get typeStructure(): TypeStructures {
    return this.#typeManager.typeStructure!;
  }

  set typeStructure(value: TypeStructures) {
    this.#typeManager.typeStructure! = value;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<TypeAliasDeclarationStructure>,
    target: TypeAliasDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    const { typeStructure } = source as unknown as TypeAliasDeclarationImpl;
    if (typeStructure) {
      target.typeStructure = TypeStructureClassesMap.clone(typeStructure);
    } else target.type = source.type;
  }

  public static clone(
    source: OptionalKind<TypeAliasDeclarationStructure>,
  ): TypeAliasDeclarationImpl {
    const target = new TypeAliasDeclarationImpl(source.name, source.type);
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.typeStructure === "object") yield this.typeStructure;
  }

  public toJSON(): StructureClassToJSON<TypeAliasDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<TypeAliasDeclarationImpl>;
    rv.kind = this.kind;
    rv.type = StructureBase[REPLACE_WRITER_WITH_STRING](this.type);
    return rv;
  }
}

TypeAliasDeclarationImpl satisfies CloneableStructure<
  TypeAliasDeclarationStructure,
  TypeAliasDeclarationImpl
> &
  Class<ExtractStructure<TypeAliasDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
