//#region preamble
import type { MethodDeclarationOverloadStructureClassIfc } from "../../exports.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
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

export default class MethodDeclarationOverloadImpl
  extends MethodDeclarationOverloadStructureBase
  implements MethodDeclarationOverloadStructureClassIfc
{
  readonly kind: StructureKind.MethodOverload = StructureKind.MethodOverload;
  isStatic: boolean;

  constructor(isStatic: boolean) {
    super();
    this.isStatic = isStatic;
  }

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
