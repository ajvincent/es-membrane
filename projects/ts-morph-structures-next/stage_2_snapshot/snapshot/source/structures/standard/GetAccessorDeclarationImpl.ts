//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
} from "../../decorators/standard/AbstractableNodeStructureMixin.js";
import {
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
} from "../../decorators/standard/DecoratableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
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
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
} from "../../decorators/standard/StatementedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../decorators/standard/TypeParameteredNodeStructureMixin.js";
import type {
  GetAccessorDeclarationStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
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
    AbstractableNodeStructureMixin,
    DecoratableNodeStructureMixin,
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

export class GetAccessorDeclarationImpl
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

  /**
   * Create a `GetAccessorDeclarationImpl` from a `GetAccessorDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
