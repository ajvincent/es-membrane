// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type ConstructorDeclarationOverloadStructure,
  type ConstructorDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  ConstructorDeclarationOverloadImpl,
} from "../exports.js";

import {
  cloneArrayOrUndefined
} from "../base/utilities.js";

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
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

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
    ConstructorDeclarationBase.cloneReturnTyped(other, clone);
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

  public toJSON(): ReplaceWriterInProperties<ConstructorDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<ConstructorDeclarationStructure>;
  }
}
ConstructorDeclarationImpl satisfies CloneableStructure<ConstructorDeclarationStructure>;

StructuresClassesMap.set(StructureKind.Constructor, ConstructorDeclarationImpl);
