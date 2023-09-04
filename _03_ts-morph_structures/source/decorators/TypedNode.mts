// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import TypeAccessors from "../base/TypeAccessors.mjs";

import StructureBase from "../base/StructureBase.mjs";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.mjs";
// #endregion preamble

declare const TypedNodeStructureKey: unique symbol;

import {
  TypedNodeTypeStructure
} from "../typeStructures/TypeAndTypeStructureInterfaces.mjs";

export type TypedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypedNodeStructureKey>,
  {
    staticFields: {
      cloneTyped(
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
    readonly #typeWriterManager = new TypeAccessors;

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
  
    get typeStructure(): TypeStructures | undefined
    {
      return this.#typeWriterManager.typeStructure;
    }
  
    set typeStructure(
      value: TypeStructures
    )
    {
      this.#typeWriterManager.typeStructure = value;
    }

    static cloneTyped(
      source: TypedNodeStructure,
      target: TypedNodeTypeStructure
    ): void
    {
      target.type = TypeAccessors.cloneType(source.type);
    }
  }
}
TypedNode satisfies SubclassDecorator<
  TypedNodeStructureFields,
  typeof StructureBase,
  false
>;
