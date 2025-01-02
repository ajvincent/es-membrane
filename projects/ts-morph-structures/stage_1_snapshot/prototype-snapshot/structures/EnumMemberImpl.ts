// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type EnumMemberStructure,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import {
  createCodeBlockWriter, replaceWriterWithString
} from "../base/utilities.js";

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
   NamedNodeStructureFields
} from "../decorators/NamedNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const EnumMemberBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.EnumMember>,
    InitializerExpressionableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.EnumMember>(StructureKind.EnumMember),
    InitializerExpressionableNode,
    JSDocableNode,
    NamedNode,
  ],
  StructureBase
)

export default class EnumMemberImpl
extends EnumMemberBase
implements EnumMemberStructure
{
  #valueOrInitializer: stringOrWriterFunction | number | undefined = undefined;

  get initializer(): stringOrWriterFunction | undefined
  {
    if (typeof this.#valueOrInitializer === "number")
      return this.#valueOrInitializer.toString();
    return this.#valueOrInitializer;
  }

  set initializer(
    value: stringOrWriterFunction | undefined
  )
  {
    this.#valueOrInitializer = value;
  }

  get value(): string | number | undefined
  {
    if (typeof this.#valueOrInitializer === "function") {
      const codeWriter = createCodeBlockWriter();
      this.#valueOrInitializer(codeWriter);
      return codeWriter.toString();
    }

    return this.#valueOrInitializer;
  }

  set value(
    value: string | number | undefined
  )
  {
    this.#valueOrInitializer = value;
  }

  constructor(name: string)
  {
    super();
    this.name = name;
  }

  public static clone(
    other: EnumMemberStructure
  ): EnumMemberImpl
  {
    const clone = new EnumMemberImpl(other.name);

    EnumMemberBase.cloneTrivia(other, clone);
    EnumMemberBase.cloneInitializerExpressionable(other, clone);
    EnumMemberBase.cloneJSDocable(other, clone);
    EnumMemberBase.cloneNamed(other, clone);

    return clone;
  }


  public toJSON(): ReplaceWriterInProperties<EnumMemberStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<EnumMemberStructure>;
    if (this.initializer)
      rv.initializer = replaceWriterWithString(this.initializer);
    return rv;
  }
}
EnumMemberImpl satisfies CloneableStructure<EnumMemberStructure>;

StructuresClassesMap.set(StructureKind.EnumMember, EnumMemberImpl);
