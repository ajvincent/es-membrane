import {
  OptionalKind,
  StructureKind,
  VariableDeclarationStructure,
} from "ts-morph";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import ExclamationTokenableNode, {
  type ExclamationTokenableNodeStructureFields
} from "../decorators/ExclamationTokenableNode.mjs";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

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
}

VariableDeclarationImpl satisfies CloneableStructure<VariableDeclarationStructure>;

StructuresClassesMap.set(StructureKind.VariableDeclaration, VariableDeclarationImpl);
