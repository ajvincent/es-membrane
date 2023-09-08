// #region
import MultiMixinBuilder from "mixin-decorators";

import {
  type IndexSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  createCodeBlockWriter,
  TypeStructureClassesMap,
  type TypeStructures,
} from "#ts-morph_structures/exports.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import TypeAccessors from "../base/TypeAccessors.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion

const IndexSignatureDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.IndexSignature>,
    JSDocableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    ReturnTypedNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.IndexSignature>(StructureKind.IndexSignature),
    JSDocableNode,
    ReadonlyableNode,
    ReturnTypedNode,
  ],
  StructureBase
);

export default class IndexSignatureDeclarationImpl
extends IndexSignatureDeclarationBase
implements IndexSignatureDeclarationStructure
{
  readonly #keyTypeAccessors = new TypeAccessors;

  keyName: string | undefined;
  get keyType(): string | undefined {
    const { type } = this.#keyTypeAccessors;
    if (typeof type === "function") {
      const writer = createCodeBlockWriter();
      type(writer);
      return writer.toString();
    }

    return type;
  }

  set keyType(value: string | undefined) {
    this.#keyTypeAccessors.type = value;
  }

  get keyTypeStructure(): TypeStructures | undefined {
    return this.#keyTypeAccessors.typeStructure;
  }
  set keyTypeStructure(value: TypeStructures | undefined) {
    this.#keyTypeAccessors.typeStructure = value;
  }

  /** @internal */
  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    if (!this.keyTypeStructure)
      return;
    if (filter(this.keyTypeStructure))
      this.keyTypeStructure = TypeStructureClassesMap.clone(replacement);
    else
      this.keyTypeStructure.replaceDescendantTypes(filter, replacement);
  }

  public static clone(
    other: OptionalKind<IndexSignatureDeclarationStructure>
  ): IndexSignatureDeclarationImpl
  {
    const clone = new IndexSignatureDeclarationImpl;

    clone.keyName = other.keyName;
    if ((other as IndexSignatureDeclarationImpl).keyTypeStructure)
      clone.keyTypeStructure = (other as IndexSignatureDeclarationImpl).keyTypeStructure;
    else
      clone.keyType = other.keyType;

    IndexSignatureDeclarationBase.cloneTrivia(other, clone);
    IndexSignatureDeclarationBase.cloneJSDocable(other, clone);
    IndexSignatureDeclarationBase.cloneReadonlyable(other, clone);
    IndexSignatureDeclarationBase.cloneReturnTyped(other, clone);

    return clone;
  }
}
IndexSignatureDeclarationImpl satisfies CloneableStructure<IndexSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.IndexSignature, IndexSignatureDeclarationImpl);
