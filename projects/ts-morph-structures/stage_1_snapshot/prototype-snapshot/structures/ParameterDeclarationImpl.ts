// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  type ParameterDeclarationStructure,
  StructureKind
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import DecoratableNode, {
  type DecoratableNodeStructureFields,
} from "../decorators/DecoratableNode.js";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.js";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.js";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.js";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.js";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

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

  public toJSON(): ReplaceWriterInProperties<ParameterDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<ParameterDeclarationStructure>;
  }
}
ParameterDeclarationImpl satisfies CloneableStructure<ParameterDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Parameter, ParameterDeclarationImpl);
