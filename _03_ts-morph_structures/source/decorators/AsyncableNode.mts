import type {
  AsyncableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "../base/StructureBase.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

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
  typeof StructureBase,
  AsyncableNodeStructureFields,
  false
>;
