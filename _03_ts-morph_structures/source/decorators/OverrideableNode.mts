// #region preamble
import type {
  OverrideableNodeStructure
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

declare const OverrideableNodeStructureKey: unique symbol;

export type OverrideableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof OverrideableNodeStructureKey>,
  {
    staticFields: {
      cloneOverrideable(
        source: OverrideableNodeStructure,
        target: Required<OverrideableNodeStructure>,
      ): void;
    };

    instanceFields: Required<OverrideableNodeStructure>;

    symbolKey: typeof OverrideableNodeStructureKey;
  }
>;

export default function OverrideableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  OverrideableNodeStructureFields["staticFields"],
  OverrideableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    hasOverrideKeyword = false;

    static cloneOverrideable(
      source: OverrideableNodeStructure,
      target: Required<OverrideableNodeStructure>
    ): void
    {
      target.hasOverrideKeyword = source.hasOverrideKeyword ?? false;
    }
  }
}

OverrideableNode satisfies SubclassDecorator<
  typeof StructureBase,
  OverrideableNodeStructureFields,
  false
>;
