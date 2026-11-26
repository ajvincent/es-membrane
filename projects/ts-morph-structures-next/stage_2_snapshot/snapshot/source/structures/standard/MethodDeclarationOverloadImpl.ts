//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
} from "../../decorators/standard/AbstractableNodeStructureMixin.js";
import {
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
} from "../../decorators/standard/AsyncableNodeStructureMixin.js";
import {
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
} from "../../decorators/standard/GeneratorableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
} from "../../decorators/standard/OverrideableNodeStructureMixin.js";
import {
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
} from "../../decorators/standard/ParameteredNodeStructureMixin.js";
import {
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
} from "../../decorators/standard/QuestionTokenableNodeStructureMixin.js";
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
import type { MethodDeclarationOverloadStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type MethodDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const MethodDeclarationOverloadStructureBase = MultiMixinBuilder<
  [
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    OverrideableNodeStructureFields,
    AbstractableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
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
    AsyncableNodeStructureMixin,
    GeneratorableNodeStructureMixin,
    OverrideableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    ScopedNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class MethodDeclarationOverloadImpl
  extends MethodDeclarationOverloadStructureBase
  implements MethodDeclarationOverloadStructureClassIfc
{
  readonly kind: StructureKind.MethodOverload = StructureKind.MethodOverload;
  isStatic: boolean;

  constructor(isStatic: boolean) {
    super();
    this.isStatic = isStatic;
  }

  /**
   * Create a `MethodDeclarationOverloadImpl` from a `MethodDeclarationOverloadStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<MethodDeclarationOverloadStructure>,
  ): MethodDeclarationOverloadImpl {
    const target = new MethodDeclarationOverloadImpl(source.isStatic ?? false);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<MethodDeclarationOverloadImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<MethodDeclarationOverloadImpl>;
    rv.isStatic = this.isStatic;
    rv.kind = this.kind;
    return rv;
  }
}

MethodDeclarationOverloadImpl satisfies CloneableStructure<
  MethodDeclarationOverloadStructure,
  MethodDeclarationOverloadImpl
> &
  Class<ExtractStructure<MethodDeclarationOverloadStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.MethodOverload,
  MethodDeclarationOverloadImpl,
);
