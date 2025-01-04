//#region preamble
import type { CallSignatureDeclarationStructureClassIfc } from "../../exports.js";
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
  type CallSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const CallSignatureDeclarationStructureBase = MultiMixinBuilder<
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

export default class CallSignatureDeclarationImpl
  extends CallSignatureDeclarationStructureBase
  implements CallSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.CallSignature = StructureKind.CallSignature;

  public static clone(
    source: OptionalKind<CallSignatureDeclarationStructure>,
  ): CallSignatureDeclarationImpl {
    const target = new CallSignatureDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<CallSignatureDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<CallSignatureDeclarationImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

CallSignatureDeclarationImpl satisfies CloneableStructure<
  CallSignatureDeclarationStructure,
  CallSignatureDeclarationImpl
> &
  Class<ExtractStructure<CallSignatureDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.CallSignature,
  CallSignatureDeclarationImpl,
);
