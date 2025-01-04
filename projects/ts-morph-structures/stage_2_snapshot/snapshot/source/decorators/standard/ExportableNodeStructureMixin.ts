//#region preamble
import type { ExportableNodeStructureClassIfc } from "../../exports.js";
import {
  COPY_FIELDS,
  type RightExtendsLeft,
  StructureBase,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import type { ExportableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const ExportableNodeStructureKey: unique symbol;
export type ExportableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ExportableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: ExportableNodeStructureClassIfc;
    symbolKey: typeof ExportableNodeStructureKey;
  }
>;

export default function ExportableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  ExportableNodeStructureFields["staticFields"],
  ExportableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class ExportableNodeStructureMixin extends baseClass {
    isDefaultExport = false;
    isExported = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: ExportableNodeStructure & Structures,
      target: ExportableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.isDefaultExport = source.isDefaultExport ?? false;
      target.isExported = source.isExported ?? false;
    }

    public toJSON(): StructureClassToJSON<ExportableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<ExportableNodeStructureMixin>;
      rv.isDefaultExport = this.isDefaultExport;
      rv.isExported = this.isExported;
      return rv;
    }
  }

  return ExportableNodeStructureMixin;
}

ExportableNodeStructureMixin satisfies SubclassDecorator<
  ExportableNodeStructureFields,
  typeof StructureBase,
  false
>;
