// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  StaticableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";
// #endregion preamble

declare const StaticableNodeStructureKey: unique symbol;

export type StaticableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof StaticableNodeStructureKey>,
  {
    staticFields: {
      cloneStaticable(
        source: StaticableNodeStructure,
        target: Required<StaticableNodeStructure>
      ): void;
    };

    instanceFields: Required<StaticableNodeStructure>;

    symbolKey: typeof StaticableNodeStructureKey;
  }
>;

export default function StaticableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  StaticableNodeStructureFields["staticFields"],
  StaticableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isStatic = false;

    static cloneStaticable(
      source: StaticableNodeStructure,
      target: Required<StaticableNodeStructure>
    ): void
    {
      target.isStatic = source.isStatic ?? false;
    }
  }
}

StaticableNode satisfies SubclassDecorator<
  StaticableNodeStructureFields,
  typeof StructureBase,
  false
>;
