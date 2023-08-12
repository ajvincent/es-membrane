import type {
  ReturnTypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import TypeWriterManager from "../base/TypeWriterManager.mjs";

import {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

import StructureBase from "./StructureBase.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import { MixinClass } from "#mixin_decorators/source/types/MixinClass.mjs";
import type {
  ReturnTypedNodeTypeStructure,
} from "../typeStructures/TypedNodeTypeStructure.mjs";

declare const ReturnTypedNodeStructureKey: unique symbol;

export type ReturnTypedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ReturnTypedNodeStructureKey>,
  {
    staticFields: {
      cloneReturnTyped(
        source: ReturnTypedNodeStructure,
        target: ReturnTypedNodeTypeStructure,
      ): void;
    },

    instanceFields: ReturnTypedNodeTypeStructure,

    symbolKey: typeof ReturnTypedNodeStructureKey
  }
>;

export default function ReturnTypedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ReturnTypedNodeStructureFields["staticFields"],
  ReturnTypedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    readonly #typeWriterManager = new TypeWriterManager;

    get returnType(): string | WriterFunction | undefined
    {
      return this.#typeWriterManager.type;
    }
  
    set returnType(
      value: string | WriterFunction | undefined
    )
    {
      this.#typeWriterManager.type = value;
    }
  
    get returnTypeStructure(): TypeStructure | undefined
    {
      return this.#typeWriterManager.typeStructure;
    }
  
    set returnTypeStructure(
      value: TypeStructure
    )
    {
      this.#typeWriterManager.typeStructure = value;
    }

    static cloneReturnTyped(
      source: ReturnTypedNodeStructure,
      target: ReturnTypedNodeTypeStructure
    ): void
    {
      target.returnType = TypeWriterManager.cloneType(source.returnType);
    }
  }
}
ReturnTypedNode satisfies SubclassDecorator<
  typeof StructureBase,
  ReturnTypedNodeStructureFields,
  false
>;
