//#region preamble
import type {
  EnumDeclarationStructureClassIfc,
  EnumMemberImpl,
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
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type EnumDeclarationStructure,
  type EnumMemberStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const EnumDeclarationStructureBase = MultiMixinBuilder<
  [
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class EnumDeclarationImpl
  extends EnumDeclarationStructureBase
  implements EnumDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Enum = StructureKind.Enum;
  isConst = false;
  readonly members: EnumMemberImpl[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<EnumDeclarationStructure>,
    target: EnumDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.isConst = source.isConst ?? false;
    if (source.members) {
      target.members.push(
        ...StructureClassesMap.cloneArrayWithKind<
          EnumMemberStructure,
          StructureKind.EnumMember,
          EnumMemberImpl
        >(
          StructureKind.EnumMember,
          StructureClassesMap.forceArray(source.members),
        ),
      );
    }
  }

  public static clone(
    source: OptionalKind<EnumDeclarationStructure>,
  ): EnumDeclarationImpl {
    const target = new EnumDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<EnumDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<EnumDeclarationImpl>;
    rv.isConst = this.isConst;
    rv.kind = this.kind;
    rv.members = this.members;
    return rv;
  }
}

EnumDeclarationImpl satisfies CloneableStructure<
  EnumDeclarationStructure,
  EnumDeclarationImpl
> &
  Class<ExtractStructure<EnumDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Enum, EnumDeclarationImpl);
