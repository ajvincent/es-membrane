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
import type { ConstructSignatureDeclarationStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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

export class ConstructSignatureDeclarationImpl
  extends ConstructSignatureDeclarationStructureBase
  implements ConstructSignatureDeclarationStructureClassIfc
{
  readonly kind: StructureKind.ConstructSignature =
    StructureKind.ConstructSignature;

  /**
   * Create a `ConstructSignatureDeclarationImpl` from a `ConstructSignatureDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
