// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type MethodDeclarationOverloadStructure,
  StructureKind
}from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.js";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.js";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.js";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.js";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.js";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<MethodDeclarationOverloadStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<MethodDeclarationOverloadStructure>;
  }
}

MethodDeclarationOverloadImpl satisfies CloneableStructure<MethodDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.MethodOverload, MethodDeclarationOverloadImpl);
