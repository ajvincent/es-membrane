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
} from "../exports.js";

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
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";

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

  public toJSON(): ReplaceWriterInProperties<ConstructSignatureDeclarationStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<ConstructSignatureDeclarationStructure>;
    rv.typeParameters = this.typeParameters.map(param => {
      if (typeof param === "object")
        return param;
      return replaceWriterWithString(param);
    });
    return rv;
  }
}

ConstructSignatureDeclarationImpl satisfies CloneableStructure<ConstructSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.ConstructSignature, ConstructSignatureDeclarationImpl);
