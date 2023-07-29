import {
  ConstructorDeclarationOverloadStructure,
  ConstructorDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { cloneArrayOrUndefined } from "./utilities.mjs";
import ConstructorDeclarationOverloadImpl from "./ConstructorDeclarationOverloadImpl.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.mjs";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.mjs";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

const ConstructorDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Constructor>,
    JSDocableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    StatementedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Constructor>(StructureKind.Constructor),
    JSDocableNode,
    ParameteredNode,
    ReturnTypedNode,
    ScopedNode,
    StatementedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class ConstructorDeclarationImpl
extends ConstructorDeclarationBase
implements ConstructorDeclarationStructure
{
  overloads: ConstructorDeclarationOverloadImpl[] = [];
  readonly kind: StructureKind.Constructor = StructureKind.Constructor;

  public static clone(
    other: OptionalKind<ConstructorDeclarationStructure>
  ): ConstructorDeclarationImpl
  {
    const clone = new ConstructorDeclarationImpl;

    ConstructorDeclarationBase.cloneTrivia(other, clone);
    ConstructorDeclarationBase.cloneJSDocable(other, clone);
    ConstructorDeclarationBase.cloneParametered(other, clone);
    ConstructorDeclarationBase.cloneReturnType(other, clone);
    ConstructorDeclarationBase.cloneScoped(other, clone);
    ConstructorDeclarationBase.cloneStatemented(other, clone);
    ConstructorDeclarationBase.cloneTypeParametered(other, clone);

    clone.overloads = cloneArrayOrUndefined<
      OptionalKind<ConstructorDeclarationOverloadStructure>,
      typeof ConstructorDeclarationOverloadImpl
    >
    (
      other.overloads, ConstructorDeclarationOverloadImpl
    );

    return clone;
  }
}
ConstructorDeclarationImpl satisfies CloneableStructure<ConstructorDeclarationStructure>;
