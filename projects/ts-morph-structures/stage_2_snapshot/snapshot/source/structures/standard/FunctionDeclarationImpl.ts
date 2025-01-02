//#region preamble
import type {
  FunctionDeclarationOverloadImpl,
  FunctionDeclarationStructureClassIfc,
} from "../../exports.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
  type ExtractStructure,
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NameableNodeStructureFields,
  NameableNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
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
  type FunctionDeclarationOverloadStructure,
  type FunctionDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const FunctionDeclarationStructureBase = MultiMixinBuilder<
  [
    NameableNodeStructureFields,
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    ExportableNodeStructureFields,
    StatementedNodeStructureFields,
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
    NameableNodeStructureMixin,
    AsyncableNodeStructureMixin,
    GeneratorableNodeStructureMixin,
    ExportableNodeStructureMixin,
    StatementedNodeStructureMixin,
    AmbientableNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class FunctionDeclarationImpl
  extends FunctionDeclarationStructureBase
  implements FunctionDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Function = StructureKind.Function;
  readonly overloads: FunctionDeclarationOverloadImpl[] = [];

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<FunctionDeclarationStructure>,
    target: FunctionDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.overloads) {
      target.overloads.push(
        ...StructureClassesMap.cloneArrayWithKind<
          FunctionDeclarationOverloadStructure,
          StructureKind.FunctionOverload,
          FunctionDeclarationOverloadImpl
        >(
          StructureKind.FunctionOverload,
          StructureClassesMap.forceArray(source.overloads),
        ),
      );
    }
  }

  public static clone(
    source: OptionalKind<FunctionDeclarationStructure>,
  ): FunctionDeclarationImpl {
    const target = new FunctionDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<FunctionDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<FunctionDeclarationImpl>;
    rv.kind = this.kind;
    rv.overloads = this.overloads;
    return rv;
  }
}

FunctionDeclarationImpl satisfies CloneableStructure<
  FunctionDeclarationStructure,
  FunctionDeclarationImpl
> &
  Class<ExtractStructure<FunctionDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Function, FunctionDeclarationImpl);
