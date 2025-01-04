// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  OverrideableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

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
  OverrideableNodeStructureFields,
  typeof StructureBase,
  false
>;
