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
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import InitializerExpressionableNode, {
  type InitializerExpressionableNodeStructureFields
} from "../decorators/InitializerExpressionableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import QuestionTokenableNode, {
  type QuestionTokenableNodeStructureFields
} from "../decorators/QuestionTokenableNode.js";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.js";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.js";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
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

  public toJSON(): ReplaceWriterInProperties<PropertySignatureStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<PropertySignatureStructure>;
    if (this.initializer)
      rv.initializer = replaceWriterWithString(this.initializer);
    return rv;
  }
}
PropertySignatureImpl satisfies CloneableStructure<PropertySignatureStructure>;

StructuresClassesMap.set(StructureKind.PropertySignature, PropertySignatureImpl);
