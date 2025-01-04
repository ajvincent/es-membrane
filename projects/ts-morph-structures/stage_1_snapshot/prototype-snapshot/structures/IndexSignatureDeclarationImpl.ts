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
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import TypeAccessors from "../base/TypeAccessors.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<IndexSignatureDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<IndexSignatureDeclarationStructure>;
  }
}
IndexSignatureDeclarationImpl satisfies CloneableStructure<IndexSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.IndexSignature, IndexSignatureDeclarationImpl);
