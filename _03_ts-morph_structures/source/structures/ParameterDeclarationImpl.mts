import {
  OptionalKind,
  ParameterDeclarationStructure,
  StructureKind
} from "ts-morph";

import { CloneableStructure } from "../types/CloneableStructure.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import DecoratableNode, {
  type DecoratableNodeStructureFields,
} from "../decorators/DecoratableNode.mjs";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.mjs";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.mjs";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.mjs";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.mjs";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../base/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

const ParameterDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Parameter>,
    DecoratableNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    NamedNodeStructureFields,
    OverrideableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    ScopedNodeStructureFields,
    TypedNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Parameter>(StructureKind.Parameter),
    DecoratableNode,
    InitializerExpressionableNode,
    NamedNode,
    OverrideableNode,
    QuestionTokenableNode,
    ReadonlyableNode,
    ScopedNode,
    TypedNode,
  ],
  StructureBase
);

export default class ParameterDeclarationImpl
extends ParameterDeclarationBase
implements ParameterDeclarationStructure
{
  readonly kind: StructureKind.Parameter = StructureKind.Parameter;
  isRestParameter = false;

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<ParameterDeclarationStructure>
  ): ParameterDeclarationImpl
  {
    const clone = new ParameterDeclarationImpl(other.name);

    clone.isRestParameter = other.isRestParameter ?? false;

    ParameterDeclarationBase.cloneTrivia(other, clone);
    ParameterDeclarationBase.cloneDecoratable(other, clone);
    ParameterDeclarationBase.cloneInitializerExpressionable(other, clone);
    ParameterDeclarationBase.cloneOverrideable(other, clone);
    ParameterDeclarationBase.cloneQuestionTokenable(other, clone);
    ParameterDeclarationBase.cloneReadonlyable(other, clone);
    ParameterDeclarationBase.cloneScoped(other, clone);
    ParameterDeclarationBase.cloneTyped(other, clone);

    return clone;
  }
}
ParameterDeclarationImpl satisfies CloneableStructure<ParameterDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Parameter, ParameterDeclarationImpl);
