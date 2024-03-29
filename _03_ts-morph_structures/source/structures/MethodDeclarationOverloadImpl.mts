// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type MethodDeclarationOverloadStructure,
  StructureKind
}from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.mjs";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.mjs";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.mjs";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.mjs";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.mjs";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const MethodDeclarationOverloadBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.MethodOverload>,
    AbstractableNodeStructureFields,
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    JSDocableNodeStructureFields,
    OverrideableNodeStructureFields,
    ParameteredNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    StaticableNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.MethodOverload>(StructureKind.MethodOverload),
    AbstractableNode,
    AsyncableNode,
    GeneratorableNode,
    JSDocableNode,
    OverrideableNode,
    ParameteredNode,
    QuestionTokenableNode,
    ReturnTypedNode,
    ScopedNode,
    StaticableNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class MethodDeclarationOverloadImpl
extends MethodDeclarationOverloadBase
implements MethodDeclarationOverloadStructure
{
  public static clone(
    other: MethodDeclarationOverloadStructure
  ): MethodDeclarationOverloadImpl
  {
    const clone = new MethodDeclarationOverloadImpl;

    MethodDeclarationOverloadBase.cloneTrivia(other, clone);
    MethodDeclarationOverloadBase.cloneAbstractable(other, clone);
    MethodDeclarationOverloadBase.cloneAsyncable(other, clone);
    MethodDeclarationOverloadBase.cloneGeneratorable(other, clone);
    MethodDeclarationOverloadBase.cloneJSDocable(other, clone);
    MethodDeclarationOverloadBase.cloneOverrideable(other, clone);
    MethodDeclarationOverloadBase.cloneParametered(other, clone);
    MethodDeclarationOverloadBase.cloneQuestionTokenable(other, clone);
    MethodDeclarationOverloadBase.cloneReturnTyped(other, clone);
    MethodDeclarationOverloadBase.cloneScoped(other, clone);
    MethodDeclarationOverloadBase.cloneStaticable(other, clone);
    MethodDeclarationOverloadBase.cloneTypeParametered(other, clone);

    return clone;
  }
}

MethodDeclarationOverloadImpl satisfies CloneableStructure<MethodDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.MethodOverload, MethodDeclarationOverloadImpl);
