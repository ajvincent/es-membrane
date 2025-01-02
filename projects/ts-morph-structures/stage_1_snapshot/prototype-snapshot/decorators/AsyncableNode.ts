// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  AsyncableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

// #endregion preamble

declare const AsyncableNodeStructureKey: unique symbol;

export type AsyncableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AsyncableNodeStructureKey>,
  {
    staticFields: {
      cloneAsyncable(
        source: AsyncableNodeStructure,
        target: Required<AsyncableNodeStructure>,
      ): void;
    },

    instanceFields: Required<AsyncableNodeStructure>,

    symbolKey: typeof AsyncableNodeStructureKey
  }
>;

export default function AsyncableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  AsyncableNodeStructureFields["staticFields"],
  AsyncableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isAsync = false;

    static cloneAsyncable(
      source: AsyncableNodeStructure,
      target: Required<AsyncableNodeStructure>
    ): void
    {
      target.isAsync = source.isAsync ?? false;
    }
  }
}

AsyncableNode satisfies SubclassDecorator<
  AsyncableNodeStructureFields,
  typeof StructureBase,
  false
>;
