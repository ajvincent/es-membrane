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
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
} from "../../decorators/standard/ScopedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../decorators/standard/TypeParameteredNodeStructureMixin.js";
import type { ConstructorDeclarationOverloadStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ConstructorDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ConstructorDeclarationOverloadStructureBase = MultiMixinBuilder<
  [
    ScopedNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ScopedNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class ConstructorDeclarationOverloadImpl
  extends ConstructorDeclarationOverloadStructureBase
  implements ConstructorDeclarationOverloadStructureClassIfc
{
  readonly kind: StructureKind.ConstructorOverload =
    StructureKind.ConstructorOverload;

  /**
   * Create a `ConstructorDeclarationOverloadImpl` from a `ConstructorDeclarationOverloadStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<ConstructorDeclarationOverloadStructure>,
  ): ConstructorDeclarationOverloadImpl {
    const target = new ConstructorDeclarationOverloadImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ConstructorDeclarationOverloadImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<ConstructorDeclarationOverloadImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

ConstructorDeclarationOverloadImpl satisfies CloneableStructure<
  ConstructorDeclarationOverloadStructure,
  ConstructorDeclarationOverloadImpl
> &
  Class<ExtractStructure<ConstructorDeclarationOverloadStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.ConstructorOverload,
  ConstructorDeclarationOverloadImpl,
);
