// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type CallSignatureDeclarationStructure,
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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const CallSignatureDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.CallSignature>,
    JSDocableNodeStructureFields,
    ParameteredNodeStructureFields,
    TypeParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.CallSignature>(StructureKind.CallSignature),
    JSDocableNode,
    ParameteredNode,
    TypeParameteredNode,
    ReturnTypedNode,
  ],
  StructureBase
);

export default class CallSignatureDeclarationImpl
extends CallSignatureDeclarationBase
implements CallSignatureDeclarationStructure
{
  public static clone(
    other: OptionalKind<CallSignatureDeclarationStructure>
  ): CallSignatureDeclarationImpl
  {
    const declaration = new CallSignatureDeclarationImpl;

    CallSignatureDeclarationBase.cloneTrivia(other, declaration);
    CallSignatureDeclarationBase.cloneJSDocable(other, declaration);
    CallSignatureDeclarationBase.cloneParametered(other, declaration);
    CallSignatureDeclarationBase.cloneTypeParametered(other, declaration);
    CallSignatureDeclarationBase.cloneReturnTyped(other, declaration);

    return declaration;
  }

  /** @internal */
  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    void(filter);
    void(replacement);

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

CallSignatureDeclarationImpl satisfies CloneableStructure<CallSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.CallSignature, CallSignatureDeclarationImpl);
