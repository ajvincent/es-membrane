// #region preamble
import assert from 'node:assert/strict'

import path from "path";

import {
  CodeBlockWriter,
  JSDocStructure,
  StructureKind,
} from "ts-morph";

import {
  COPY_FIELDS_NAME,
  distDir
} from "#stage_two/generation/build/constants.js";

import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";
import {
  ArrayTypedStructureImpl,
  LiteralTypedStructureImpl,
  JSDocImpl,
  ParenthesesTypedStructureImpl,
  PropertyDeclarationImpl,
  TypeStructureKind,
  TypeStructures,
  UnionTypedStructureImpl,
  stringOrWriterFunction,
  StatementStructureImpls,
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
} from '#utilities/source/StructureNameTransforms.js';

import ClassFieldStatementsMap from "../utilities/public/ClassFieldStatementsMap.js";

import {
  write_cloneRequiredAndOptionalArray,
  write_cloneStatementsArray,
  write_cloneStructureArray,
} from '../utilities/write_cloneArray.js';
// #endregion preamble

export default function addClassProperties(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  const properties: PropertyDeclarationImpl[] = [];

  meta.booleanKeys.forEach(key => {
    const prop = new PropertyDeclarationImpl(key);
    properties.push(prop);

    parts.classFieldsStatements.set(
      key, ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, ["false"]
    );
    parts.classMembersMap.addMembers([prop]);
    addJSDocsToProperty(prop, meta);

    if (key !== "isStatic") {
      parts.classFieldsStatements.set(key, COPY_FIELDS_NAME, [
        `target.${key} = source.${key} ?? false;`
      ]);
    }
  });

  meta.structureFieldArrays.forEach((
    propertyValue: PropertyValue,
    propertyKey: PropertyName
  ): void => addStructureFieldArray(name, meta, dictionaries, parts, propertyValue, propertyKey));

  meta.structureFields.forEach((
    propertyValue: PropertyValue,
    propertyKey: PropertyName
  ): void => addStructureField(meta, dictionaries, parts, propertyValue, propertyKey));
  parts.classMembersMap.addMembers(properties);
}

function addStructureFieldArray(
  structureName: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  const signature = parts.classImplementsMap.getAsKind<StructureKind.PropertySignature>(
    propertyKey, StructureKind.PropertySignature
  )!;
  signature.isReadonly = true;

  const prop = new PropertyDeclarationImpl(propertyKey);
  prop.isReadonly = true;

  let typeStructure = getTypeStructureForValue(propertyValue, parts, dictionaries);
  if (typeStructure.kind === TypeStructureKind.Union)
    typeStructure = new ParenthesesTypedStructureImpl(typeStructure);

  prop.typeStructure = new ArrayTypedStructureImpl(typeStructure);
  addJSDocsToProperty(prop, meta);

  // this has to come early because write_cloneStatementsArray depends on it.
  parts.classMembersMap.addMembers([prop]);

  const hasAStructure = propertyValue.otherTypes.some(
    valueInUnion => valueInUnion.structureName && dictionaries.structures.has(valueInUnion.structureName)
  );

  let statements: (stringOrWriterFunction | StatementStructureImpls)[] = [];

  if (hasAStructure) {
    if (propertyValue.otherTypes.length === 2) {
      statements.push(write_cloneRequiredAndOptionalArray(
        structureName, dictionaries, parts, propertyValue, propertyKey
      ));
    }
    else {
      statements.push(write_cloneStructureArray(
        structureName, dictionaries, parts, propertyValue, propertyKey
      ));
    }
  }
  else if (propertyKey === "statements") {
    statements = write_cloneStatementsArray(
      structureName, dictionaries, parts, propertyValue, propertyKey
    );
  }
  else {
    statements.push((writer: CodeBlockWriter): void => {
      writer.write(`if (Array.isArray(source.${propertyKey})) `);
      writer.block(() => {
        writer.write(`target.${propertyKey}.push(...source.${propertyKey});`);
      });
      writer.write(`else if (source.${propertyKey} !== undefined)`);
      writer.block(() => {
        writer.write(`target.${propertyKey}.push(source.${propertyKey});`)
      });
    });
  }

  parts.classFieldsStatements.set(propertyKey, COPY_FIELDS_NAME, statements);
  parts.classFieldsStatements.set(
    propertyKey, ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, ["[]"]
  );
}

function addStructureField(
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  const prop = new PropertyDeclarationImpl(propertyKey);
  prop.hasQuestionToken = propertyValue.hasQuestionToken;

  if (prop.hasQuestionToken) {
    parts.classImplementsMap.getAsKind<StructureKind.PropertySignature>(
      propertyKey, StructureKind.PropertySignature
    )!.hasQuestionToken = true;
  }

  let typeStructure = getTypeStructureForValue(propertyValue, parts, dictionaries);
  if (typeStructure.kind === TypeStructureKind.Union)
    typeStructure = new ParenthesesTypedStructureImpl(typeStructure);

  if ((typeStructure !== ConstantTypeStructures.string) || prop.hasQuestionToken)
    prop.typeStructure = typeStructure;

  const initializer = getInitializerForValue(propertyKey, propertyValue, parts, dictionaries);
  if (initializer) {
    parts.classFieldsStatements.set(propertyKey, ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, [
      initializer
    ]);
  }

  if (propertyKey === "kind") {
    prop.isReadonly = true;
  }
  else {
    const hasAStructure = propertyValue.otherTypes.some(
      valueInUnion => valueInUnion.structureName && dictionaries.structures.has(valueInUnion.structureName)
    );
    if (hasAStructure) {
      assert(false, "structure found and needs entry in copyFields");
    }
    else if (propertyValue.hasQuestionToken) {
      parts.classFieldsStatements.set(propertyKey, COPY_FIELDS_NAME, [
        `if (source.${propertyKey}) {\n  target.${propertyKey} = source.${propertyKey};\n}\n`,
      ]);
    }
    else {
      parts.classFieldsStatements.set(propertyKey, COPY_FIELDS_NAME, [
        `target.${propertyKey} = source.${propertyKey};`,
      ]);
    }
  }

  addJSDocsToProperty(prop, meta);

  parts.classMembersMap.addMembers([prop]);
}

function getTypeStructureForValue(
  value: PropertyValue,
  parts: DecoratorParts | StructureParts,
  dictionaries: StructureDictionaries,
): TypeStructures
{
  const structures = getTypeStructureArrayForValue(value, parts, dictionaries);
  if (structures.length === 1) {
    return structures[0];
  }
  return new UnionTypedStructureImpl(structures);
}

function getTypeStructureArrayForValue(
  value: PropertyValue,
  parts: DecoratorParts | StructureParts,
  dictionaries: StructureDictionaries
): TypeStructures[]
{
  const typeStructures: LiteralTypedStructureImpl[] = [];

  if (value.mayBeString && value.mayBeWriter) {
    typeStructures.push(
      ConstantTypeStructures.stringOrWriterFunction as LiteralTypedStructureImpl
    );

    parts.importsManager.addImports({
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
    parts.importsManager.addImports({
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

      if (implName !== parts.classDecl.name) {
        parts.importsManager.addImports({
          pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
          isPackageImport: false,
          importNames: [implName],
          isDefaultImport: false,
          isTypeOnly: true,
        });
      }

      return;
    }

    typeStructures.push(new LiteralTypedStructureImpl(
      valueInUnion.structureName ??
      valueInUnion.unionName ??
      valueInUnion.tsmorph_Type!
    ));

    if (valueInUnion.structureName) {
      parts.importsManager.addImports({
        pathToImportedModule: "ts-morph",
        isPackageImport: true,
        importNames: [valueInUnion.structureName],
        isDefaultImport: false,
        isTypeOnly: true
      });
    }

    if (valueInUnion.unionName) {
      parts.importsManager.addImports({
        pathToImportedModule: "ts-morph",
        isPackageImport: true,
        importNames: [valueInUnion.unionName],
        isDefaultImport: false,
        isTypeOnly: true
      });
    }

    if (valueInUnion.tsmorph_Type) {
      if (valueInUnion.tsmorph_Type !== "number") {
        parts.importsManager.addImports({
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

function getInitializerForValue(
  key: PropertyName,
  value: PropertyValue,
  parts: DecoratorParts | StructureParts,
  dictionaries: StructureDictionaries
): string | undefined
{
  if (value.mayBeUndefined || value.hasQuestionToken) {
    return "undefined";
  }

  if (value.mayBeString) {
    return `""`;
  }

  if (key === "kind") {
    return value.otherTypes[0].tsmorph_Type!;
  }

  void(parts);
  void(dictionaries);
  return undefined;
}

function addJSDocsToProperty(
  property: PropertyDeclarationImpl,
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
