// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  Structure,
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import TypeAccessors from "../base/TypeAccessors.js";

import type StructureBase from "../base/StructureBase.js";

import {
  replaceWriterWithString,
} from "../base/utilities.js";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import {
  TypedNodeTypeStructure
} from "../typeStructures/TypeAndTypeStructureInterfaces.js";

import {
  ReplaceWriterInProperties
} from "../types/ModifyWriterInTypes.js";
// #endregion preamble

declare const TypedNodeStructureKey: unique symbol;

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

    public toJSON(): ReplaceWriterInProperties<TypedNodeStructure & Structure> {
      const rv = super.toJSON() as ReplaceWriterInProperties<TypedNodeStructure>;
      if (this.#typeWriterManager.type)
        rv.type = replaceWriterWithString<string>(this.#typeWriterManager.type);
      return rv;
    }
  }
}
TypedNode satisfies SubclassDecorator<
  TypedNodeStructureFields,
  typeof StructureBase,
  false
>;
