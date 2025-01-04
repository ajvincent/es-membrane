// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type ConstructorDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.js";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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


  public toJSON(): ReplaceWriterInProperties<ConstructorDeclarationOverloadStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<ConstructorDeclarationOverloadStructure>;
  }
}
ConstructorDeclarationOverloadImpl satisfies CloneableStructure<ConstructorDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.ConstructorOverload, ConstructorDeclarationOverloadImpl);
