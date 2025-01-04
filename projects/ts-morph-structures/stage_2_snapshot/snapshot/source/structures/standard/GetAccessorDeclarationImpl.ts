//#region preamble
import type {
  GetAccessorDeclarationStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const GetAccessorDeclarationStructureBase = MultiMixinBuilder<
  [
    DecoratableNodeStructureFields,
    AbstractableNodeStructureFields,
    ScopedNodeStructureFields,
    StatementedNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    DecoratableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    ScopedNodeStructureMixin,
    StatementedNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class GetAccessorDeclarationImpl
  extends GetAccessorDeclarationStructureBase
  implements GetAccessorDeclarationStructureClassIfc
{
  readonly kind: StructureKind.GetAccessor = StructureKind.GetAccessor;
  isStatic: boolean;

  constructor(isStatic: boolean, name: string, returnType?: TypeStructures) {
    super();
    this.isStatic = isStatic;
    this.name = name;
    if (returnType) {
      this.returnTypeStructure = returnType;
    }
  }

  public static clone(
    source: OptionalKind<GetAccessorDeclarationStructure>,
  ): GetAccessorDeclarationImpl {
    const target = new GetAccessorDeclarationImpl(
      source.isStatic ?? false,
      source.name,
    );
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<GetAccessorDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<GetAccessorDeclarationImpl>;
    rv.isStatic = this.isStatic;
    rv.kind = this.kind;
    return rv;
  }
}

GetAccessorDeclarationImpl satisfies CloneableStructure<
  GetAccessorDeclarationStructure,
  GetAccessorDeclarationImpl
> &
  Class<ExtractStructure<GetAccessorDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.GetAccessor, GetAccessorDeclarationImpl);
