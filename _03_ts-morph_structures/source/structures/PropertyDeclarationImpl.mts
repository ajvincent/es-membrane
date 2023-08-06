import {
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.mjs";
import ExclamationTokenableNode, {
  type ExclamationTokenableNodeStructureFields
} from "../decorators/ExclamationTokenableNode.mjs";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
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
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.mjs";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

const PropertyDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Property>,
    AbstractableNodeStructureFields,
    AmbientableNodeStructureFields,
    DecoratableNodeStructureFields,
    ExclamationTokenableNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    OverrideableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    ScopedNodeStructureFields,
    StaticableNodeStructureFields,
    TypedNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Property>(StructureKind.Property),
    AbstractableNode,
    AmbientableNode,
    DecoratableNode,
    ExclamationTokenableNode,
    InitializerExpressionableNode,
    JSDocableNode,
    NamedNode,
    OverrideableNode,
    QuestionTokenableNode,
    ReadonlyableNode,
    ScopedNode,
    StaticableNode,
    TypedNode,
  ],
  StructureBase
);

export default class PropertyDeclarationImpl
extends PropertyDeclarationBase
implements PropertyDeclarationStructure
{
  readonly kind: StructureKind.Property = StructureKind.Property
  hasAccessorKeyword = false;

  constructor(name: string)
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<PropertyDeclarationStructure>
  ): PropertyDeclarationImpl
  {
    const clone = new PropertyDeclarationImpl(other.name);

    clone.hasAccessorKeyword = other.hasAccessorKeyword ?? false;

    PropertyDeclarationBase.cloneTrivia(other, clone);
    PropertyDeclarationBase.cloneAbstractable(other, clone);
    PropertyDeclarationBase.cloneAmbientable(other, clone);
    PropertyDeclarationBase.cloneDecoratable(other, clone);
    PropertyDeclarationBase.cloneExclamationTokenable(other, clone);
    PropertyDeclarationBase.cloneInitializerExpressionable(other, clone);
    PropertyDeclarationBase.cloneJSDocable(other, clone);
    PropertyDeclarationBase.cloneOverrideable(other, clone);
    PropertyDeclarationBase.cloneQuestionTokenable(other, clone);
    PropertyDeclarationBase.cloneReadonlyable(other, clone);
    PropertyDeclarationBase.cloneScoped(other, clone);
    PropertyDeclarationBase.cloneStaticable(other, clone);
    PropertyDeclarationBase.cloneTyped(other, clone);

    return clone;
  }

  public static fromSignature(
    signature: OptionalKind<PropertySignatureStructure>
  ): PropertyDeclarationImpl
  {
    const clone = new PropertyDeclarationImpl(signature.name);

    PropertyDeclarationBase.cloneTrivia(signature, clone);
    PropertyDeclarationBase.cloneInitializerExpressionable(signature, clone);
    PropertyDeclarationBase.cloneJSDocable(signature, clone);
    PropertyDeclarationBase.cloneQuestionTokenable(signature, clone);
    PropertyDeclarationBase.cloneReadonlyable(signature, clone);
    PropertyDeclarationBase.cloneTyped(signature, clone);

    return clone;
  }
}
PropertyDeclarationImpl satisfies CloneableStructure<PropertyDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Property, PropertyDeclarationImpl);
