// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  ReturnTypedNodeStructure,
  Structure,
  WriterFunction,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

import TypeAccessors from "../base/TypeAccessors.js";

import {
  replaceWriterWithString,
} from "../base/utilities.js";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import type {
  ReturnTypedNodeTypeStructure,
} from "../typeStructures/TypeAndTypeStructureInterfaces.js";

import {
  ReplaceWriterInProperties,
} from "../types/ModifyWriterInTypes.js";
// #endregion preamble

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
    constructor() {
      super();

      // returnType is getting lost in ts-morph clone operations
      this.#typeWriterManager = TypeAccessors.buildTypeAccessors(this, "returnType");
    }

    readonly #typeWriterManager: TypeAccessors;

    // overridden in constructor
    returnType: string | WriterFunction | undefined;
  
    get returnTypeStructure(): TypeStructures | undefined
    {
      return this.#typeWriterManager.typeStructure;
    }
  
    set returnTypeStructure(
      value: TypeStructures
    )
    {
      this.#typeWriterManager.typeStructure = value;
    }

    static cloneReturnTyped(
      source: ReturnTypedNodeStructure,
      target: ReturnTypedNodeTypeStructure
    ): void
    {
      target.returnType = TypeAccessors.cloneType(source.returnType);
    }

    public toJSON(): ReplaceWriterInProperties<ReturnTypedNodeStructure & Structure> {
      const rv = super.toJSON() as ReplaceWriterInProperties<ReturnTypedNodeStructure>;
      if (this.#typeWriterManager.type)
        rv.returnType = replaceWriterWithString<string>(this.#typeWriterManager.type);
      return rv;
    }
  };
}
ReturnTypedNode satisfies SubclassDecorator<
  ReturnTypedNodeStructureFields,
  typeof StructureBase,
  false
>;
