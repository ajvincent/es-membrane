// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.js";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.js";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.js";
import ExclamationTokenableNode, {
  type ExclamationTokenableNodeStructureFields
} from "../decorators/ExclamationTokenableNode.js";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
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
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.js";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.js";

import {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

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
  readonly kind: StructureKind.Property = StructureKind.Property;
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

  public toJSON(): ReplaceWriterInProperties<PropertyDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<PropertyDeclarationStructure>;
  }
}
PropertyDeclarationImpl satisfies CloneableStructure<PropertyDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Property, PropertyDeclarationImpl);
