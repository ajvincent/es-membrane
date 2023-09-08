// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type ConstructSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  TypeStructureClassesMap,
  type TypeStructures,
} from "#ts-morph_structures/exports.mjs";

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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

// #endregion preamble

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

  /** @internal */
  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    this.parameters.forEach(param => {
      if (!param.typeStructure)
        return;
      if (filter(param.typeStructure))
        param.typeStructure = TypeStructureClassesMap.clone(replacement);
      else
        param.typeStructure.replaceDescendantTypes(filter, replacement);
    });

    this.typeParameters.forEach(typeParam => {
      if (typeof typeParam === "string")
        return;
      typeParam.replaceDescendantTypes(filter, replacement);
    });

    if (this.returnTypeStructure) {
      if (filter(this.returnTypeStructure))
        this.returnTypeStructure = TypeStructureClassesMap.clone(replacement);
      else
        this.returnTypeStructure.replaceDescendantTypes(filter, replacement);
    }
  }

}

ConstructSignatureDeclarationImpl satisfies CloneableStructure<ConstructSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.ConstructSignature, ConstructSignatureDeclarationImpl);
