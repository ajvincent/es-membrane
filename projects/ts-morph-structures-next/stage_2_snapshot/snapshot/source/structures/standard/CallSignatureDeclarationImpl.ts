//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
} from "../../decorators/standard/ParameteredNodeStructureMixin.js";
import {
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
} from "../../decorators/standard/ReturnTypedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../decorators/standard/TypeParameteredNodeStructureMixin.js";
import type { CallSignatureDeclarationStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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

export class CallSignatureDeclarationImpl
  extends CallSignatureDeclarationStructureBase
  implements CallSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.CallSignature = StructureKind.CallSignature;

  /**
   * Create a `CallSignatureDeclarationImpl` from a `CallSignatureDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
