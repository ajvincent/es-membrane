//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
} from "../../decorators/standard/DecoratableNodeStructureMixin.js";
import {
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
} from "../../decorators/standard/InitializerExpressionableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
} from "../../decorators/standard/OverrideableNodeStructureMixin.js";
import {
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
} from "../../decorators/standard/QuestionTokenableNodeStructureMixin.js";
import {
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
} from "../../decorators/standard/ReadonlyableNodeStructureMixin.js";
import {
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
} from "../../decorators/standard/ScopedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../decorators/standard/TypedNodeStructureMixin.js";
import type { ParameterDeclarationStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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
    OverrideableNodeStructureFields,
    ReadonlyableNodeStructureFields,
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
    OverrideableNodeStructureMixin,
    ReadonlyableNodeStructureMixin,
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

export class ParameterDeclarationImpl
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

  /**
   * Create a `ParameterDeclarationImpl` from a `ParameterDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
