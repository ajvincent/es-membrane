import type {
  WriterFunction
} from "ts-morph";

import { StructureImplMeta, StructureName } from "../structureMeta/DataClasses.js";
import StructureDictionaries from "../StructureDictionaries.js";

import pairedWrite from "./pairedWrite.js";
import {
  LiteralTypedStructureImpl,
  TupleTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";
import ConstantTypeStructures from "./ConstantTypeStructures.js";
import ImportManager from "./public/ImportManager.js";

export default function StructureMixinWriter(
  meta: StructureImplMeta,
  importManager: ImportManager,
  dictionaries: StructureDictionaries,
  countMap: ReadonlyMap<StructureName, number>,
): WriterFunction
{
  const metaKeys = Array.from(meta.decoratorKeys);
  metaKeys.sort((a, b) => {
    return countMap.get(a)! - countMap.get(b)!;
  });

  const decoratorImplArray = metaKeys.map(key => dictionaries.decorators.get(key)!);
  const decoratorPartsArray = decoratorImplArray.map(impl => dictionaries.decoratorParts.get(impl)!);

  const fieldTypeNames: string[] = decoratorPartsArray.map(parts => parts.fieldsTypeAlias.name);
  const decoratorFunctionNames: string[] = decoratorPartsArray.map(parts => parts.wrapperFunction.name!);

  importManager.addImports({
    pathToImportedModule: "mixin-decorators",
    isPackageImport: true,
    isDefaultImport: true,
    isTypeOnly: false,
    importNames: [
      "MultiMixinBuilder",
    ]
  });

  importManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: fieldTypeNames,
    isDefaultImport: false,
    isTypeOnly: true
  });

  importManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: decoratorFunctionNames.concat("StructureBase"),
    isDefaultImport: false,
    isTypeOnly: false
  });

  const fieldsTuple = new TupleTypedStructureImpl(
    decoratorPartsArray.map(parts => new LiteralTypedStructureImpl(parts.fieldsTypeAlias.name))
  );

  return function(writer): void {
    writer.write(`const ${meta.structureName + "Base"} = MultiMixinBuilder`);
    pairedWrite(writer, "<", ">", true, true, () => {
      fieldsTuple.writerFunction(writer);
      writer.write(", ");
      ConstantTypeStructures["typeof StructureBase"].writerFunction(writer);
    });

    // this is a CallExpression, which isn't a type
    pairedWrite(writer, "(", ");", true, true, () => {
      pairedWrite(writer, "[", "],", true, true, () => {
        decoratorPartsArray.forEach(parts => {
          writer.writeLine(parts.classDecl.name! + ",");
        });
      });

      writer.write("StructureBase");
    });
  }
}
