import {
  CodeBlockWriter,
} from "ts-morph";

import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
  DecoratorHook,
  StructureHook,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

export function debugDecoratorIfNameStart(
  prefix: string
): DecoratorHook
{
  return function(
    name: string,
    meta: DecoratorImplMeta,
    dictionaries: StructureDictionaries
  ): void
  {
    if (name.startsWith(prefix)) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    void(meta);
    void(dictionaries);
  }
}

export function debugStructureIfNameStart(
  prefix: string
): StructureHook
{
  return function(
    name: string,
    meta: StructureImplMeta,
    dictionaries: StructureDictionaries
  ): void
  {
    if (name.startsWith(prefix)) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    void(meta);
    void(dictionaries);
  }
}

export function logDecoratorIfNameStart(
  prefix: string
): DecoratorHook
{
  return function(
    name: string,
    meta: DecoratorImplMeta,
    dictionaries: StructureDictionaries
  ): void
  {
    if (name.startsWith(prefix))
      logParts(prefix, name, meta, dictionaries);
  }
}

export function logStructureIfNameStart(
  prefix: string
): StructureHook
{
  return function(
    name: string,
    meta: StructureImplMeta,
    dictionaries: StructureDictionaries
  ): void
  {
    if (name.startsWith(prefix))
      logParts(prefix, name, meta, dictionaries);
  }
}

function logParts(
  prefix: string,
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

  const {
    booleanKeys,
    structureFields,
    structureFieldArrays,
  } = meta;

  const {
    classDecl,
    classFieldsStatements,
    classMembersMap,
    classImplementsMap,
    importsManager,
  } = parts;

  const fields = Array.from(classFieldsStatements.entries()).map(entry => [
    entry[0], entry[1], entry[2].map(stmt => replaceWriterWithString(stmt))
  ]);

  console.log(JSON.stringify({
    imports: importsManager.getDeclarations().map(decl => decl.toJSON()),
    booleanKeys: Object.fromEntries(booleanKeys.entries()),
    structureFields: Object.fromEntries(structureFields.entries()),
    structureFieldArrays: Object.fromEntries(structureFieldArrays.entries()),
    interfaceMembers: Object.fromEntries(classImplementsMap.entries()),
    members: Object.fromEntries(classMembersMap.entries()),
    fields,
    classDecl,
  }, null, 2));
}

export function replaceWriterWithString
(
  value: unknown,
): unknown
{
  if (typeof value === "function") {
    const writer = new CodeBlockWriter();
    value(writer);
    return writer.toString();
  }

  return value;
}
