import {
  ConstructorDeclarationOverloadStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

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
    ConstructorDeclarationOverloadBase.cloneReturnType(other, clone);
    ConstructorDeclarationOverloadBase.cloneScoped(other, clone);
    ConstructorDeclarationOverloadBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
ConstructorDeclarationOverloadImpl satisfies CloneableStructure<ConstructorDeclarationOverloadStructure>;
