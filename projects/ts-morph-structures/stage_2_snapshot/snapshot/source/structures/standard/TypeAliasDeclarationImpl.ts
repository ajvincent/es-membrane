//#region preamble
import type {
  stringOrWriterFunction,
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
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
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
    TypedNodeStructureFields,
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
    TypedNodeStructureMixin,
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

  constructor(name: string, type: stringOrWriterFunction | TypeStructures) {
    super();
    this.name = name;
    if (typeof type === "object") {
      this.typeStructure = type;
    } else {
      this.type = type;
    }
  }

  get type(): stringOrWriterFunction {
    return super.type ?? "";
  }

  set type(value: stringOrWriterFunction) {
    super.type = value;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<TypeAliasDeclarationStructure>,
    target: TypeAliasDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.type = source.type;
  }

  public static clone(
    source: OptionalKind<TypeAliasDeclarationStructure>,
  ): TypeAliasDeclarationImpl {
    const target = new TypeAliasDeclarationImpl(source.name, source.type);
    this[COPY_FIELDS](source, target);
    return target;
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
