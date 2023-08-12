import {
  StructureKind,
  EnumMemberStructure,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

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
   NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";

import {
  createCodeBlockWriter
} from "../base/utilities.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

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
}
EnumMemberImpl satisfies CloneableStructure<EnumMemberStructure>;

StructuresClassesMap.set(StructureKind.EnumMember, EnumMemberImpl);
