// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import {
  KindedStructure,
  StructureKind
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";
// #endregion preamble

declare const KindedStructureKey: unique symbol;

export type KindedStructureFields<TKind extends StructureKind> = RightExtendsLeft<
  StaticAndInstance<typeof KindedStructureKey>,
  {
    staticFields: object;
    instanceFields: KindedStructure<TKind>;
    symbolKey: typeof KindedStructureKey;
  }
>;

function KindedStructure<TKind extends StructureKind>(
  kind: TKind
): SubclassDecorator<KindedStructureFields<TKind>, typeof StructureBase, false>
{
  return function (
    baseClass: typeof StructureBase,
    context: ClassDecoratorContext
  ): MixinClass<
    KindedStructureFields<TKind>["staticFields"],
    KindedStructureFields<TKind>["instanceFields"],
    typeof StructureBase
  >
  {
    void(context);
    return class extends baseClass {
      readonly kind = kind;
    }
  }
}
KindedStructure satisfies SubclassDecorator<
  KindedStructureFields<StructureKind>, typeof StructureBase, [StructureKind]
>;

export default KindedStructure;
