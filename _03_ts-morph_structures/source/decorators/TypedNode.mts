import type {
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import TypeWriterManager from "../structures/TypeWriterManager.mjs";

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

declare const TypedNodeStructureKey: unique symbol;

import {
  TypedNodeTypeStructure
} from "../typeStructures/TypedNodeTypeStructure.mjs";

export type TypedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypedNodeStructureKey>,
  {
    staticFields: {
      cloneType(
        source: TypedNodeStructure,
        target: TypedNodeTypeStructure,
      ): void;
    },

    instanceFields: TypedNodeTypeStructure,

    symbolKey: typeof TypedNodeStructureKey
  }
>;

export default function TypedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  TypedNodeStructureFields["staticFields"],
  TypedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    readonly #typeWriterManager = new TypeWriterManager;

    get type(): string | WriterFunction | undefined
    {
      return this.#typeWriterManager.type;
    }

    set type(
      value: string | WriterFunction | undefined
    )
    {
      this.#typeWriterManager.type = value;
    }
  
    get typeStructure(): TypeStructure | undefined
    {
      return this.#typeWriterManager.typeStructure;
    }
  
    set typeStructure(
      value: TypeStructure | undefined
    )
    {
      this.#typeWriterManager.typeStructure = value;
    }

    static cloneType(
      source: TypedNodeStructure,
      target: TypedNodeTypeStructure
    ): void
    {
      target.type = source.type;
    }
  }
}
TypedNode satisfies SubclassDecorator<
  typeof StructureBase,
  TypedNodeStructureFields,
  false
>;
