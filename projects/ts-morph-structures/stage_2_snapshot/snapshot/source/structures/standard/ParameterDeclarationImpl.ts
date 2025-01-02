//#region preamble
import type { ParameterDeclarationStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
  type ExtractStructure,
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type ParameterDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ParameterDeclarationStructureBase = MultiMixinBuilder<
  [
    ReadonlyableNodeStructureFields,
    OverrideableNodeStructureFields,
    TypedNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    DecoratableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ScopedNodeStructureFields,
    NamedNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ReadonlyableNodeStructureMixin,
    OverrideableNodeStructureMixin,
    TypedNodeStructureMixin,
    InitializerExpressionableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    ScopedNodeStructureMixin,
    NamedNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class ParameterDeclarationImpl
  extends ParameterDeclarationStructureBase
  implements ParameterDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Parameter = StructureKind.Parameter;
  isRestParameter = false;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ParameterDeclarationStructure>,
    target: ParameterDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.isRestParameter = source.isRestParameter ?? false;
  }

  public static clone(
    source: OptionalKind<ParameterDeclarationStructure>,
  ): ParameterDeclarationImpl {
    const target = new ParameterDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ParameterDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ParameterDeclarationImpl>;
    rv.isRestParameter = this.isRestParameter;
    rv.kind = this.kind;
    return rv;
  }
}

ParameterDeclarationImpl satisfies CloneableStructure<
  ParameterDeclarationStructure,
  ParameterDeclarationImpl
> &
  Class<ExtractStructure<ParameterDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Parameter, ParameterDeclarationImpl);
