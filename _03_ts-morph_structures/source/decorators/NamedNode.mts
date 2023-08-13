import type {
  NamedNodeStructure
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

declare const NamedNodeStructureKey: unique symbol;

export type NamedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof NamedNodeStructureKey>,
  {
    staticFields: {
      cloneNamed(
        source: NamedNodeStructure,
        target: NamedNodeStructure,
      ): void;
    },

    instanceFields: NamedNodeStructure,

    symbolKey: typeof NamedNodeStructureKey
  }
>;

export default function NamedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  NamedNodeStructureFields["staticFields"],
  NamedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    name = "";

    static cloneNamed(
      source: NamedNodeStructure,
      target: NamedNodeStructure
    ): void
    {
      target.name = source.name;
    }
  }
}

NamedNode satisfies SubclassDecorator<
  typeof StructureBase,
  NamedNodeStructureFields,
  false
>;
