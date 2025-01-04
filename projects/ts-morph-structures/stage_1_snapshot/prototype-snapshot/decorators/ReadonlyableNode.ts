// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  ReadonlyableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
// #endregion preamble

declare const ReadonlyableNodeStructureKey: unique symbol;

export type ReadonlyableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ReadonlyableNodeStructureKey>,
  {
    staticFields: {
      cloneReadonlyable(
        source: ReadonlyableNodeStructure,
        target: Required<ReadonlyableNodeStructure>,
      ): void;
    },

    instanceFields: Required<ReadonlyableNodeStructure>,

    symbolKey: typeof ReadonlyableNodeStructureKey
  }
>;

export default function ReadonlyableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ReadonlyableNodeStructureFields["staticFields"],
  ReadonlyableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isReadonly = false;

    static cloneReadonlyable(
      source: ReadonlyableNodeStructure,
      target: Required<ReadonlyableNodeStructure>
    ): void
    {
      target.isReadonly = source.isReadonly ?? false;
    }
  }
}

ReadonlyableNode satisfies SubclassDecorator<
  ReadonlyableNodeStructureFields,
  typeof StructureBase,
  false
>;
