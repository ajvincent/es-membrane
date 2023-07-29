import {
  ConstructSignatureDeclarationStructure,
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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

const ConstructSignatureDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.ConstructSignature>,
    JSDocableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.ConstructSignature>(StructureKind.ConstructSignature),
    JSDocableNode,
    ParameteredNode,
    ReturnTypedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class ConstructSignatureDeclarationImpl
extends ConstructSignatureDeclarationBase
implements ConstructSignatureDeclarationStructure
{
  public static clone(
    other: OptionalKind<ConstructSignatureDeclarationStructure>
  ): ConstructSignatureDeclarationImpl
  {
    const clone = new ConstructSignatureDeclarationImpl;

    ConstructSignatureDeclarationBase.cloneTrivia(other, clone);
    ConstructSignatureDeclarationBase.cloneJSDocable(other, clone);
    ConstructSignatureDeclarationBase.cloneParametered(other, clone);
    ConstructSignatureDeclarationBase.cloneReturnTyped(other, clone);
    ConstructSignatureDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }
}

ConstructSignatureDeclarationImpl satisfies CloneableStructure<ConstructSignatureDeclarationStructure>;
