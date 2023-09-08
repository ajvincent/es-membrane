// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type MethodSignatureStructure,
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
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.mjs";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.mjs";
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

const MethodSignatureBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.MethodSignature>,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    ParameteredNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.MethodSignature>(StructureKind.MethodSignature),
    JSDocableNode,
    NamedNode,
    ParameteredNode,
    QuestionTokenableNode,
    ReturnTypedNode,
    TypeParameteredNode
  ],
  StructureBase
)

export default class MethodSignatureImpl
extends MethodSignatureBase
implements MethodSignatureStructure
{
  constructor(name: string) {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<MethodSignatureStructure>
  ): MethodSignatureImpl
  {
    const clone = new MethodSignatureImpl(other.name);

    MethodSignatureBase.cloneTrivia(other, clone);
    MethodSignatureBase.cloneJSDocable(other, clone);
    MethodSignatureBase.cloneParametered(other, clone);
    MethodSignatureBase.cloneQuestionTokenable(other, clone);
    MethodSignatureBase.cloneReturnTyped(other, clone);
    MethodSignatureBase.cloneTypeParametered(other, clone);

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
MethodSignatureImpl satisfies CloneableStructure<MethodSignatureStructure>;

StructuresClassesMap.set(StructureKind.MethodSignature, MethodSignatureImpl);
