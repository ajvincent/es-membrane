// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  ExportableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

// #endregion preamble

declare const ExportableNodeStructureKey: unique symbol;

export type ExportableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ExportableNodeStructureKey>,
  {
    staticFields: {
      cloneExportable(
        source: ExportableNodeStructure,
        target: Required<ExportableNodeStructure>
      ): void;
    },

    instanceFields: Required<ExportableNodeStructure>,

    symbolKey: typeof ExportableNodeStructureKey
  }
>;

export default function ExportableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ExportableNodeStructureFields["staticFields"],
  ExportableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isExported = false;
    isDefaultExport = false;

    static cloneExportable(
      source: ExportableNodeStructure,
      target: Required<ExportableNodeStructure>
    ): void
    {
      target.isDefaultExport = source.isDefaultExport ?? false;
      target.isExported = source.isExported ?? false;
    }
  }
}

ExportableNode satisfies SubclassDecorator<
  ExportableNodeStructureFields,
  typeof StructureBase,
  false
>;
