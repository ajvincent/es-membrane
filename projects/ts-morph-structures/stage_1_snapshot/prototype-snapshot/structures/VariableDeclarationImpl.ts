// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  StructureKind,
  type VariableDeclarationStructure,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import ExclamationTokenableNode, {
  type ExclamationTokenableNodeStructureFields
} from "../decorators/ExclamationTokenableNode.js";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.js";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const VariableDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.VariableDeclaration>,
    ExclamationTokenableNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    NamedNodeStructureFields,
    TypedNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.VariableDeclaration>(StructureKind.VariableDeclaration),
    ExclamationTokenableNode,
    InitializerExpressionableNode,
    NamedNode,
    TypedNode,
  ],
  StructureBase
);

export default class VariableDeclarationImpl
extends VariableDeclarationBase
implements VariableDeclarationStructure
{
  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<VariableDeclarationStructure>
  ): VariableDeclarationImpl
  {
    const clone = new VariableDeclarationImpl(other.name);

    VariableDeclarationBase.cloneTrivia(other, clone);
    VariableDeclarationBase.cloneExclamationTokenable(other, clone);
    VariableDeclarationBase.cloneInitializerExpressionable(other, clone);
    VariableDeclarationBase.cloneTyped(other, clone);

    return clone;
  }

  public toJSON(): ReplaceWriterInProperties<VariableDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<VariableDeclarationStructure>;
  }
}

VariableDeclarationImpl satisfies CloneableStructure<VariableDeclarationStructure>;

StructuresClassesMap.set(StructureKind.VariableDeclaration, VariableDeclarationImpl);
