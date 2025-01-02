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
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
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

function KindedStructureMixin<TKind extends StructureKind>(
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
KindedStructureMixin satisfies SubclassDecorator<
  KindedStructureFields<StructureKind>, typeof StructureBase, [StructureKind]
>;

export default KindedStructureMixin;
