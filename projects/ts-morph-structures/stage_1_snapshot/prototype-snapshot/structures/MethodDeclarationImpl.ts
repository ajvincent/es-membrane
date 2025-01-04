// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type MethodDeclarationStructure,
  type MethodDeclarationOverloadStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  Scope,
  StructureKind,
} from "ts-morph";

import {
  DecoratorImpl,
  JSDocImpl,
  MethodDeclarationOverloadImpl,
  ParameterDeclarationImpl,
  TypeParameterDeclarationImpl,
  TypeStructures,
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import {
  cloneArrayOrUndefined,
} from "../base/utilities.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.js";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.js";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.js";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import OverrideableNode, {
  type OverrideableNodeStructureFields
} from "../decorators/OverrideableNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.js";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.js";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.js";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  AppendableStructure,
} from "../types/AppendableStructure.js";

import type {
  BooleanFlagsStructure
} from "../types/BooleanFlagsStructure.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<MethodDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<MethodDeclarationStructure>;
  }
}
MethodDeclarationImpl satisfies CloneableStructure<MethodDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Method, MethodDeclarationImpl);
