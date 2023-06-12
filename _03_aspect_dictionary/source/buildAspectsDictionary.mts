import fs from "fs/promises";
import path from "path";

import {
  ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

const fieldToArgTypes: ReadonlyMap<string, string> = new Map([
  ["classInvariants", "VoidMethodsOnly<Type>"],
  ["bodyComponents", "IndeterminateClass<Type>"],
]);

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

export default
async function buildAspectsDictionary(
  targetDir: ModuleSourceDirectory
): Promise<void>
{
  const destinationFile = pathToModule(targetDir, "AspectsDictionary.mts");
  let found = false;

  try {
    await fs.access(destinationFile);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(destinationFile, { recursive: true });

  let source = `
/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "/_03_aspect_dictionary/source/Aspects-Dictionary-base.mts.in"}
 * @see {@link "/_03_aspect_dictionary/source/buildAspectsDictionary.mts"}
 */
`.trim() + "\n\n";

  source += await fs.readFile(
    pathToModule(stageDir, "source/AspectsDictionary-base.mts.in"), { encoding: "utf-8" }
  );

  source = replaceSources(source, [
    { commentLine: "//@ASPECTS_BUILDER_FIELDS", callback: replaceBuilderFields },
    { commentLine: "//@ASPECTS_BUILDER_CONSTRUCTOR", callback: replaceBuilderConstructorFields },
    { commentLine: "//@ASPECTS_DICTIONARY_CLASS_FIELDS", callback: replaceDictionaryClassFields },
    { commentLine: "//@ASPECTS_BUILDER_FOREACH", callback: replaceBuilderForEach },
    { commentLine: "//@ASPECTS_DECORATORS_INTERFACE", callback: replaceDecoratorsInterface },
    { commentLine: "//@ASPECTS_DECORATORS_CLASS", callback: replaceDecoratorsClass },
    { commentLine: "//@ASPECTS_BUILDER_KEYS", callback: replaceBuilderKeys },
  ]);

  await fs.mkdir(path.dirname(destinationFile), { recursive: true });
  await fs.writeFile(destinationFile, source, { encoding: "utf-8" });
}

function replaceSources(source: string, builders: ReadonlyArray<{
  commentLine: string,
  callback: ((this: void, type: string, fieldName: string) => string)
}>): string
{
  builders.forEach(builder => {
    let newSource = "";
    fieldToArgTypes.forEach((type, fieldName) => newSource += builder.callback(fieldName, type) + "\n");
    source = source.replace(builder.commentLine, newSource);
  });
  return source;
}

function replaceDictionaryClassFields(this: void, fieldName: string, type: string): string {
  return `  readonly ${fieldName}: PushableArray<${type}> = [];`;
}

function replaceBuilderFields(this: void, fieldName: string, type: string) : string {
  return `  readonly ${fieldName}: UnshiftableArray<(new (thisObj: Type) => ${type})> = [];`;
}

function replaceBuilderConstructorFields(this: void, fieldName: string) : string {
  return `      this.${fieldName}.push(...baseBuilder.${fieldName});`;
}

function replaceBuilderForEach(this: void, fieldName: string) : string {
  return [
    `  __builder__.${fieldName}.forEach(__subBuilder__ => {`,
    `    __dictionary__.${fieldName}.push(new __subBuilder__(__wrapped__));`,
    `  });`
  ].join("\n");
}

function replaceBuilderKeys(this: void, fieldName: string) : string {
  return `  "${fieldName}",`;
}

function replaceDecoratorsInterface(this: void, fieldName: string, type: string): string {
  return [
    `  ${fieldName}: ClassDecoratorFunction<`,
    `    Class<Type>, false, [callback: new (thisObj: Type) => ${type}]`,
    `  >;`,
  ].join("\n") + "\n";
}

function replaceDecoratorsClass(this: void, fieldName: string, type: string): string {
  return [
    `  ${fieldName}(`,
    `    this: void,`,
    `    callback: Class<${type}, [Type]>`,
    `  ): ClassDecoratorFunction<Class<Type>, false, false>`,
    `  {`,
    `    return function(baseClass, context): void {`,
    `      void(context);`,
    `      const builder = getAspectBuilderForClass<Type>(baseClass);`,
    `      builder.${fieldName}.unshift(callback);`,
    `    }`,
    `  }`,
  ].join("\n") + "\n";
}
