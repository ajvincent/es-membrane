import fs from "fs/promises";
import path from "path";

import { pathToModule } from "#stage_utilities/source/AsyncSpecModules.mjs";
import { stageDir } from "./constants.mjs";

const fieldToArgTypes: ReadonlyMap<string, string> = new Map([
  ["classInvariants", "VoidMethodsOnly<WrapThisAndParameters<Type>>"],
  ["bodyComponents", "IndeterminateClass<Type>"],
]);

export default
async function buildAspectsDictionarySource(): Promise<void> {
  const destinationFile = pathToModule(stageDir, "source/generated/AspectsDictionary.mts");
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
 * @see {@link "../../build/Aspects-Dictionary-base.mts.in"}
 * @see {@link "../../build/buildAspectsDictionary.mts"}
 */
`.trim() + "\n\n";

  source += await fs.readFile(
    pathToModule(stageDir, "build/AspectsDictionary-base.mts.in"), { encoding: "utf-8" }
  );

  source = replaceSources(source, [
    { commentLine: "//@ASPECTS_DICTIONARY_FIELDS", callback: replaceDictionaryFields },
    { commentLine: "//@ASPECTS_BUILDER_FIELDS", callback: replaceBuilderFields },
    { commentLine: "//@ASPECTS_BUILDER_CONSTRUCTOR", callback: replaceBuilderConstructorFields },
    { commentLine: "//@ASPECTS_BUILDER_FOREACH", callback: replaceBuilderForEach },
    { commentLine: "//@ASPECTS_BUILDER_KEYS", callback: replaceBuilderKeys },
    { commentLine: "//@ASPECTS_DECORATORS_INTERFACE", callback: replaceDecoratorsInterface },
    { commentLine: "//@ASPECTS_DECORATORS_CLASS", callback: replaceDecoratorsClass },
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
    fieldToArgTypes.forEach((type, fieldName) => newSource += builder.callback(fieldName, type));
    source = source.replace(builder.commentLine, newSource);
  });
  return source;
}

function replaceDictionaryFields(this: void, fieldName: string, type: string): string {
  return `  readonly ${fieldName}: PushableArray<${type}> = [];\n`;
}

function replaceBuilderFields(this: void, fieldName: string, type: string) : string {
  return `  readonly ${fieldName}: PushableArray<(thisObj: Type) => ${type}> = [];\n`;
}

function replaceBuilderConstructorFields(this: void, fieldName: string) : string {
  return `      this.${fieldName}.push(...baseBuilder.${fieldName});\n`;
}

function replaceBuilderForEach(this: void, fieldName: string) : string {
  return [
    `  __builder__.${fieldName}.forEach(__subBuilder__ => {`,
    `    __dictionary__.${fieldName}.push(__subBuilder__(__instance__));`,
    `  });`,
    ""
  ].join("\n");
}

function replaceBuilderKeys(this: void, fieldName: string) : string {
  return `  "${fieldName}",\n`;
}

function replaceDecoratorsInterface(this: void, fieldName: string, type: string): string {
  return [
    `  ${fieldName}: ClassDecoratorFunction<`,
    `    ClassWithAspects<Type>, false, [callback: (thisObj: Type) => ${type}]`,
    `  >;`,
    ""
  ].join("\n");
}

function replaceDecoratorsClass(this: void, fieldName: string, type: string): string {
  return [
    `  ${fieldName}(`,
    `    this: void,`,
    `    callback: (thisObj: Type) => ${type}`,
    `  ): ClassDecoratorFunction<ClassWithAspects<Type>, false, false>`,
    `  {`,
    `    return function(baseClass, context): void {`,
    `      void(context);`,
    `      baseClass[ASPECTS_BUILDER].${fieldName}.push(callback);`,
    `    }`,
    `  }`,
    ""
  ].join("\n");
}
