//#region preamble
import type { ConstructSignatureDeclarationStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
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
  type ConstructSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ConstructSignatureDeclarationStructureBase = MultiMixinBuilder<
  [
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class ConstructSignatureDeclarationImpl
  extends ConstructSignatureDeclarationStructureBase
  implements ConstructSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.ConstructSignature =
    StructureKind.ConstructSignature;

  public static clone(
    source: OptionalKind<ConstructSignatureDeclarationStructure>,
  ): ConstructSignatureDeclarationImpl {
    const target = new ConstructSignatureDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ConstructSignatureDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<ConstructSignatureDeclarationImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

ConstructSignatureDeclarationImpl satisfies CloneableStructure<
  ConstructSignatureDeclarationStructure,
  ConstructSignatureDeclarationImpl
> &
  Class<ExtractStructure<ConstructSignatureDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.ConstructSignature,
  ConstructSignatureDeclarationImpl,
);
