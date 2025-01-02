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
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.js";
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


  public toJSON(): ReplaceWriterInProperties<MethodSignatureStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<MethodSignatureStructure>;
  }
}
MethodSignatureImpl satisfies CloneableStructure<MethodSignatureStructure>;

StructuresClassesMap.set(StructureKind.MethodSignature, MethodSignatureImpl);
