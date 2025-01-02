// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  NamedNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
// #endregion preamble

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
  NamedNodeStructureFields,
  typeof StructureBase,
  false
>;
