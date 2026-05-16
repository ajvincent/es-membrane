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
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

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

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
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
    constructor() {
      super();

      // type is getting lost in ts-morph clone operations
      this.#typeWriterManager = TypeAccessors.buildTypeAccessors(this, "type");
    }

    readonly #typeWriterManager: TypeAccessors;

    // overridden in constructor
    type: string | WriterFunction | undefined;

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

    /** @internal */
    public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures> {
      yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
      if (typeof this.typeStructure === "object")
        yield this.typeStructure;
    }
  };
}
TypedNode satisfies SubclassDecorator<
  TypedNodeStructureFields,
  typeof StructureBase,
  false
>;
