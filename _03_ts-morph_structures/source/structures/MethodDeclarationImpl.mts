// #region preamble
import {
  type MethodDeclarationStructure,
  type MethodDeclarationOverloadStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  Scope,
  StructureKind,
} from "ts-morph";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import {
  DecoratorImpl,
  JSDocImpl,
  MethodDeclarationOverloadImpl,
  ParameterDeclarationImpl,
  TypeParameterDeclarationImpl,
  TypeStructures,
} from "../../exports.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import {
  cloneArrayOrUndefined,
} from "../base/utilities.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.mjs";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.mjs";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.mjs";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.mjs";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.mjs";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.mjs";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.mjs";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import type {
  AppendableStructure,
} from "../types/AppendableStructure.mjs";

import type {
  BooleanFlagsStructure
} from "../types/BooleanFlagsStructure.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

export type MethodDeclarationEnableFlags = (
  "hasOverrideKeyword" |
  "hasQuestionToken" |
  "isAbstract" |
  "isAsync" |
  "isGenerator" |
  "isStatic"
);

export type MethodDeclarationAppendContext = (
  {
    returnType: TypeStructures
  } |
  (
    JSDocImpl |
    DecoratorImpl |
    MethodDeclarationOverloadImpl |
    TypeParameterDeclarationImpl |
    ParameterDeclarationImpl
  )[]
);

const MethodDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Method>,
    AbstractableNodeStructureFields,
    AsyncableNodeStructureFields,
    DecoratableNodeStructureFields,
    GeneratorableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    OverrideableNodeStructureFields,
    ParameteredNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    StaticableNodeStructureFields,
    StatementedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Method>(StructureKind.Method),
    AbstractableNode,
    AsyncableNode,
    DecoratableNode,
    GeneratorableNode,
    JSDocableNode,
    NamedNode,
    OverrideableNode,
    ParameteredNode,
    QuestionTokenableNode,
    ReturnTypedNode,
    ScopedNode,
    StaticableNode,
    StatementedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class MethodDeclarationImpl
extends MethodDeclarationBase
implements
  MethodDeclarationStructure,
  BooleanFlagsStructure<MethodDeclarationEnableFlags>,
  AppendableStructure<MethodDeclarationAppendContext>
{
  overloads: MethodDeclarationOverloadImpl[] = [];

  constructor(
    name: string,
  )
  {
    super();
    this.name = name;
  }

  public setScope(
    scope: Scope | undefined
  ): this
  {
    this.scope = scope;
    return this;
  }

  enableFlags(
    flags: MethodDeclarationEnableFlags[]
  ): this
  {
    for (const flag of flags) {
      this[flag] = true;
    }

    return this;
  }

  appendStructures(
    structuresContext: MethodDeclarationAppendContext
  ): this
  {
    if (!Array.isArray(structuresContext)) {
      this.returnTypeStructure = structuresContext.returnType;
      return this;
    }

    for (const structure of structuresContext) {
      switch (structure.kind) {
        case StructureKind.Decorator:
          this.decorators.push(structure);
          continue;
        case StructureKind.JSDoc:
          this.docs.push(structure);
          continue;
        case StructureKind.TypeParameter:
          this.typeParameters.push(structure);
          continue;
        case StructureKind.Parameter:
          this.parameters.push(structure);
      }
    }

    return this;
  }

  public static clone(
    other: OptionalKind<MethodDeclarationStructure>
  ): MethodDeclarationImpl
  {
    const clone = new MethodDeclarationImpl(other.name);

    clone.overloads = cloneArrayOrUndefined<
      OptionalKind<MethodDeclarationOverloadStructure>,
      typeof MethodDeclarationOverloadImpl
    >(other.overloads, MethodDeclarationOverloadImpl);

    MethodDeclarationBase.cloneTrivia(other, clone);
    MethodDeclarationBase.cloneAbstractable(other, clone);
    MethodDeclarationBase.cloneAsyncable(other, clone);
    MethodDeclarationBase.cloneDecoratable(other, clone);
    MethodDeclarationBase.cloneGeneratorable(other, clone);
    MethodDeclarationBase.cloneJSDocable(other, clone);
    MethodDeclarationBase.cloneNamed(other, clone);
    MethodDeclarationBase.cloneOverrideable(other, clone);
    MethodDeclarationBase.cloneParametered(other, clone);
    MethodDeclarationBase.cloneQuestionTokenable(other, clone);
    MethodDeclarationBase.cloneReturnTyped(other, clone);
    MethodDeclarationBase.cloneScoped(other, clone);
    MethodDeclarationBase.cloneStaticable(other, clone);
    MethodDeclarationBase.cloneStatemented(other, clone);
    MethodDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }

  public static fromSignature(
    signature: OptionalKind<MethodSignatureStructure>
  ): MethodDeclarationImpl
  {
    const clone = new MethodDeclarationImpl(signature.name);

    MethodDeclarationBase.cloneTrivia(signature, clone);
    MethodDeclarationBase.cloneJSDocable(signature, clone);
    MethodDeclarationBase.cloneParametered(signature, clone);
    MethodDeclarationBase.cloneQuestionTokenable(signature, clone);
    MethodDeclarationBase.cloneReturnTyped(signature, clone);
    MethodDeclarationBase.cloneTypeParametered(signature, clone);

    return clone;
  }
}
MethodDeclarationImpl satisfies CloneableStructure<MethodDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Method, MethodDeclarationImpl);
