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
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";

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
