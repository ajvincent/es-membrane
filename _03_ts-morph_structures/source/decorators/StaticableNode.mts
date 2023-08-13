import type {
  StaticableNodeStructure
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
  typeof StructureBase,
  StaticableNodeStructureFields,
  false
>;
