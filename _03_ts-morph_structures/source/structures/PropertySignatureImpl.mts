// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  type PropertySignatureStructure,
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
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.mjs";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.mjs";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const PropertySignatureBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.PropertySignature>,
    InitializerExpressionableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    TypedNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.PropertySignature>(StructureKind.PropertySignature),
    InitializerExpressionableNode,
    JSDocableNode,
    NamedNode,
    QuestionTokenableNode,
    ReadonlyableNode,
    TypedNode,
  ],
  StructureBase
)

export default class PropertySignatureImpl
extends PropertySignatureBase
implements PropertySignatureStructure
{
  initializer: stringOrWriterFunction | undefined = undefined;

  constructor(name: string)
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<PropertySignatureStructure>
  ): PropertySignatureImpl
  {
    const clone = new PropertySignatureImpl(other.name);

    PropertySignatureBase.cloneTrivia(other, clone);
    PropertySignatureBase.cloneInitializerExpressionable(other, clone);
    PropertySignatureBase.cloneJSDocable(other, clone);
    PropertySignatureBase.cloneQuestionTokenable(other, clone);
    PropertySignatureBase.cloneReadonlyable(other, clone);
    PropertySignatureBase.cloneTyped(other, clone);

    return clone;
  }

  /** @internal */
  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    if (this.typeStructure) {
      if (filter(this.typeStructure))
        this.typeStructure = TypeStructureClassesMap.clone(replacement);
      else
        this.typeStructure.replaceDescendantTypes(filter, replacement);
    }
  }
}
PropertySignatureImpl satisfies CloneableStructure<PropertySignatureStructure>;

StructuresClassesMap.set(StructureKind.PropertySignature, PropertySignatureImpl);
