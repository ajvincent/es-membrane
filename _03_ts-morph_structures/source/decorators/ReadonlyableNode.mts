// #region preamble
import type {
  ReadonlyableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "../base/StructureBase.mjs";
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
  typeof StructureBase,
  ReadonlyableNodeStructureFields,
  false
>;
