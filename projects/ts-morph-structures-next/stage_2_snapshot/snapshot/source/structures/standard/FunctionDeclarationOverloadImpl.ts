//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
} from "../../decorators/standard/AmbientableNodeStructureMixin.js";
import {
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
} from "../../decorators/standard/AsyncableNodeStructureMixin.js";
import {
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
} from "../../decorators/standard/ExportableNodeStructureMixin.js";
import {
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
} from "../../decorators/standard/GeneratorableNodeStructureMixin.js";
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
import type { FunctionDeclarationOverloadStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type FunctionDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const FunctionDeclarationOverloadStructureBase = MultiMixinBuilder<
  [
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    AsyncableNodeStructureMixin,
    GeneratorableNodeStructureMixin,
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class FunctionDeclarationOverloadImpl
  extends FunctionDeclarationOverloadStructureBase
  implements FunctionDeclarationOverloadStructureClassIfc
{
  readonly kind: StructureKind.FunctionOverload =
    StructureKind.FunctionOverload;

  /**
   * Create a `FunctionDeclarationOverloadImpl` from a `FunctionDeclarationOverloadStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<FunctionDeclarationOverloadStructure>,
  ): FunctionDeclarationOverloadImpl {
    const target = new FunctionDeclarationOverloadImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<FunctionDeclarationOverloadImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<FunctionDeclarationOverloadImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

FunctionDeclarationOverloadImpl satisfies CloneableStructure<
  FunctionDeclarationOverloadStructure,
  FunctionDeclarationOverloadImpl
> &
  Class<ExtractStructure<FunctionDeclarationOverloadStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.FunctionOverload,
  FunctionDeclarationOverloadImpl,
);
