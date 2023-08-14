// #region preamble
import {
  type ConstructorDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const ConstructorDeclarationOverloadBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.ConstructorOverload>,
    JSDocableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.ConstructorOverload>(StructureKind.ConstructorOverload),
    JSDocableNode,
    ParameteredNode,
    ReturnTypedNode,
    ScopedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class ConstructorDeclarationOverloadImpl
extends ConstructorDeclarationOverloadBase
implements ConstructorDeclarationOverloadStructure
{

  public static clone(
    other: OptionalKind<ConstructorDeclarationOverloadStructure>
  ): ConstructorDeclarationOverloadImpl
  {
    const clone = new ConstructorDeclarationOverloadImpl;

    ConstructorDeclarationOverloadBase.cloneTrivia(other, clone);
    ConstructorDeclarationOverloadBase.cloneJSDocable(other, clone);
    ConstructorDeclarationOverloadBase.cloneParametered(other, clone);
    ConstructorDeclarationOverloadBase.cloneReturnTyped(other, clone);
    ConstructorDeclarationOverloadBase.cloneScoped(other, clone);
    ConstructorDeclarationOverloadBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
ConstructorDeclarationOverloadImpl satisfies CloneableStructure<ConstructorDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.ConstructorOverload, ConstructorDeclarationOverloadImpl);
