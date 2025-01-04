// #region preamble
import path from "path";

import type {
  JSDocStructure
} from "ts-morph";

import {
  distDir
} from "#stage_two/generation/build/constants.js";

import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";
import {
  ArrayTypedStructureImpl,
  JSDocImpl,
  LiteralTypedStructureImpl,
  ParenthesesTypedStructureImpl,
  PropertySignatureImpl,
  type TypeStructures,
  TypeStructureKind,
  UnionTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  PropertyName,
  PropertyValue,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  getStructureImplName,
  getUnionOfStructuresName,
} from "#utilities/source/StructureNameTransforms.js";

export default function addInterfaceFields(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  void(name);

  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  meta.booleanKeys.forEach(key => {
    const prop = new PropertySignatureImpl(key);
    prop.typeStructure = ConstantTypeStructures.boolean;
    parts.classImplementsMap.addMembers([prop]);
    addJSDocsToProperty(prop, meta);
  });

  meta.structureFieldArrays.forEach((
    propertyValue: PropertyValue,
    propertyKey: PropertyName
  ): void => addStructureFieldArray(meta, dictionaries, parts, propertyValue, propertyKey));

  meta.structureFields.forEach((
    propertyValue: PropertyValue,
    propertyKey: PropertyName
  ): void => addStructureField(meta, dictionaries, parts, propertyValue, propertyKey));
}

function addStructureFieldArray(
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  const prop = new PropertySignatureImpl(propertyKey);
  //prop.hasQuestionToken = propertyValue.hasQuestionToken;

  let typeStructure: TypeStructures = getTypeStructureForValue(propertyValue, parts, dictionaries);
  if (typeStructure.kind === TypeStructureKind.Union)
    typeStructure = new ParenthesesTypedStructureImpl(typeStructure);

  prop.typeStructure = new ArrayTypedStructureImpl(typeStructure);
  addJSDocsToProperty(prop, meta);
  parts.classImplementsMap.addMembers([prop]);
}

function addStructureField(
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  const prop = new PropertySignatureImpl(propertyKey);

  let typeStructure: TypeStructures = getTypeStructureForValue(propertyValue, parts, dictionaries);
  if (typeStructure.kind === TypeStructureKind.Union)
    typeStructure = new ParenthesesTypedStructureImpl(typeStructure);

  prop.typeStructure = typeStructure;

  if (propertyKey === "kind") {
    prop.isReadonly = true;
    prop.type = propertyValue.otherTypes[0].tsmorph_Type!;
  }

  addJSDocsToProperty(prop, meta);

  parts.classImplementsMap.addMembers([prop]);
}

function getTypeStructureForValue(
  value: PropertyValue,
  parts: DecoratorParts | StructureParts,
  dictionaries: StructureDictionaries,
): LiteralTypedStructureImpl | UnionTypedStructureImpl
{
  const structures: LiteralTypedStructureImpl[] = getTypeStructureArrayForValue(
    value, parts, dictionaries
  );
  if (structures.length === 1) {
    return structures[0];
  }

  return new UnionTypedStructureImpl(structures);
}

function getTypeStructureArrayForValue(
  value: PropertyValue,
  parts: DecoratorParts | StructureParts,
  dictionaries: StructureDictionaries
): LiteralTypedStructureImpl[]
{
  const typeStructures: LiteralTypedStructureImpl[] = [];

  if (value.mayBeString && value.mayBeWriter) {
    typeStructures.push(
      ConstantTypeStructures.stringOrWriterFunction as LiteralTypedStructureImpl
    );

    parts.implementsImports.addImports({
      pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
      isPackageImport: false,
      importNames: ["stringOrWriterFunction"],
      isDefaultImport: false,
      isTypeOnly: true,
    });

    dictionaries.publicExports.addExports({
      absolutePathToModule: path.join(distDir, "source/types/stringOrWriterFunction.d.ts"),
      exportNames: ["stringOrWriterFunction"],
      isDefaultExport: false,
      isType: true,
    });
  }
  else if (value.mayBeString) {
    typeStructures.push(ConstantTypeStructures.string as LiteralTypedStructureImpl);
  }
  else if (value.mayBeWriter) {
    typeStructures.push(ConstantTypeStructures.WriterFunction as LiteralTypedStructureImpl);
    parts.implementsImports.addImports({
      pathToImportedModule: "ts-morph",
      isPackageImport: true,
      importNames: ["WriterFunction"],
      isDefaultImport: false,
      isTypeOnly: true
    });
  }

  if (value.mayBeUndefined) {
    typeStructures.push(ConstantTypeStructures.undefined as LiteralTypedStructureImpl);
  }

  value.otherTypes.forEach(valueInUnion => {
    if (valueInUnion.structureName && dictionaries.structures.has(valueInUnion.structureName)) {
      const implName = getStructureImplName(valueInUnion.structureName);
      typeStructures.push(new LiteralTypedStructureImpl(implName));

      parts.implementsImports.addImports({
        pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
        isPackageImport: false,
        importNames: [implName],
        isDefaultImport: false,
        isTypeOnly: true,
      });

      return;
    }

    if (valueInUnion.unionName && dictionaries.unions.has(valueInUnion.unionName)) {
      const unionName = getUnionOfStructuresName(valueInUnion.unionName);
      typeStructures.push(new LiteralTypedStructureImpl(unionName));

      parts.implementsImports.addImports({
        pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
        isPackageImport: false,
        importNames: [unionName],
        isDefaultImport: false,
        isTypeOnly: true,
      });

      return;
    }

    const name: string = valueInUnion.structureName ?? valueInUnion.unionName ?? valueInUnion.tsmorph_Type!;
    typeStructures.push(new LiteralTypedStructureImpl(name));

    if (valueInUnion.structureName) {
      parts.implementsImports.addImports({
        pathToImportedModule: "ts-morph",
        isPackageImport: true,
        importNames: [valueInUnion.structureName],
        isDefaultImport: false,
        isTypeOnly: true
      });
    }

    if (valueInUnion.unionName) {
      parts.implementsImports.addImports({
        pathToImportedModule: "ts-morph",
        isPackageImport: true,
        importNames: [name],
        isDefaultImport: false,
        isTypeOnly: true
      });
    }

    if (valueInUnion.tsmorph_Type) {
      if (valueInUnion.tsmorph_Type !== "number") {
        parts.implementsImports.addImports({
          pathToImportedModule: "ts-morph",
          isPackageImport: true,
          importNames: [valueInUnion.tsmorph_Type.replace(/\..*/g, "")],
          isDefaultImport: false,
          isTypeOnly: true
        });
      }
    }
  });

  typeStructures.sort(compareLiterals);

  return typeStructures;
}

function addJSDocsToProperty(
  property: PropertySignatureImpl,
  meta: StructureImplMeta | DecoratorImplMeta
): void
{
  const originalDocs: readonly JSDocStructure[] | undefined = meta.jsDocStructuresMap.get(property.name);
  if (!originalDocs)
    throw new Error("no docs found for property " + property.name);
  const jsDocs = originalDocs.map(doc => JSDocImpl.clone(doc));
  property.docs.push(...jsDocs);
}

function compareLiterals(
  a: LiteralTypedStructureImpl,
  b: LiteralTypedStructureImpl
): number
{
  for (const tail of tailStrings) {
    if (a.stringValue === tail)
      return +1;
    if (b.stringValue === tail)
      return -1;
  }

  return a.stringValue.localeCompare(b.stringValue);
}

const tailStrings: readonly string[] = [
  "undefined",
  "stringOrWriterFunction",
  "WriterFunction",
  "string",
];
