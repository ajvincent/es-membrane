import path from "path";
import url from "url";
import fs from "fs/promises";

import type {
  SetReturnType,
} from "type-fest";

import type {
  ModuleSourceDirectory,
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

// #region methods-only types

type MethodsOnlyInternal = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: CallableFunction & ((this: object, ...args: any[]) => any)
};

export type MethodsOnly<T> = T extends MethodsOnlyInternal ? T : never;

export type VoidMethodsOnly<T> = T extends MethodsOnlyInternal ? {
  [key in keyof T]: SetReturnType<T[key], void>
} : never;

// #endregion methods-only types

// #region aspect types and helper classes

/**
 * The aspect-oriented types we're trying to use.
 */
export type AspectsDictionary<T extends MethodsOnlyInternal> = {
  classInvariant: ReadonlyArray<VoidMethodsOnly<T>>;
  /*
  precondition: ReadonlyArray<VoidMethodsOnly<T>>;
  checkArguments: ReadonlyArray<VoidMethodsOnly<T>>;
  bodyAssert: ReadonlyArray<VoidMethodsOnly<T>>;
  checkReturn: ReadonlyArray<VoidMethodsOnly<T>>;
  postcondition: ReadonlyArray<VoidMethodsOnly<T>>;
  */
};

/** A symbol key for protected aspects dictionaries. */
export const ASPECTS_KEY = Symbol("Aspects key");

/** For building out the aspects we're applying. */
export class
Aspects<T extends MethodsOnlyInternal> implements AspectsDictionary<T>
{
  classInvariant = [];
}

export class AspectError extends Error {
  readonly name = "AspectError";
}

// #endregion aspect types and helper classes

// #region aspect class generation

type ArgParameter = [string, string];

type FileWithExport = ModuleSourceDirectory & {
  readonly leafName: string;
  readonly exportName: string;
}

/**
 * This is a quick & dirty class generator for aspect-oriented programming.
 *
 * @param typeFile - the type file location and export name.
 * @param classFile - the base class file location and export name.
 * @param argDictionary - methodName: [[argName: argType]]
 * @param targetClassName - the class name we try to generate.
 * @param absTargetPath - where to write the target class file.
 */
export async function buildAspectClassRaw(
  typeFile: FileWithExport,
  classFile: FileWithExport,
  argDictionary: {
    [key: string] : ReadonlyArray<ArgParameter>
  },
  targetClassName: string,
  absTargetPath: string,
) : Promise<void>
{
  const absTypeSourcePath  = getAbsolutePath(typeFile);
  const absClassSourcePath = getAbsolutePath(classFile);

  const thisSourcePath = url.fileURLToPath(import.meta.url);

  const argEntries = Object.entries(argDictionary);

  const methodsSource = argEntries.map(([key, args]) => {
    const argNames = `[${args.map(param => param[0]).join(", ")}]`;
    const argList = args.map(param => param.join(": "));
    return "  " + `
${key}(${argList.join(", ")}): ReturnType<${typeFile.exportName}["${key}"]>
  {
    const __aspects__ = this[ASPECTS_KEY];

${buildAspectTryBlock(
  "classInvariant",
  key,
  argNames,
  "class invariant failed on enter"
)}
    const __rv__ = super.${key}.apply(this, ${argNames});

${buildAspectTryBlock(
  "classInvariant",
  key,
  argNames,
  "classInvariant failed on leave"
)}
    return __rv__;
  }`.trim();
  }).join("\n\n");

  const fileContents = `
/* This file is generated.  Do not edit. */

import {
  ASPECTS_KEY,
  type AspectsDictionary,
  AspectError,
} from "${
  path.relative(path.dirname(absTargetPath), thisSourcePath)
}";

import type { ${typeFile.exportName} } from "${
  path.relative(path.dirname(absTargetPath), absTypeSourcePath)
}";
import ${classFile.exportName} from "${
  path.relative(path.dirname(absTargetPath), absClassSourcePath)
}";

abstract class ${targetClassName}Abstract extends ${classFile.exportName}
{
  protected abstract [ASPECTS_KEY]: AspectsDictionary<${typeFile.exportName}>;

${methodsSource}
}

export abstract class ${targetClassName}Debug extends ${targetClassName}Abstract {}

export abstract class ${targetClassName} extends ${targetClassName}Abstract {}
  `.trim() + "\n";

  await fs.writeFile(absTargetPath, fileContents, { encoding: "utf-8" });
}

/** Get an absolute path for an exported file. */
function getAbsolutePath(context: FileWithExport) : string
{
  return path.normalize(path.join(
    url.fileURLToPath(context.importMeta.url),
    context.pathToDirectory,
    context.leafName
  ));
}

/**
 * Build a code block to run aspects.
 *
 * @param aspectName - the aspect dictionary field name.
 * @param key - the method name to execute.
 * @param argNames - the arguments to pass to each aspect.
 * @param errorMessage - a message describing the type of failure.
 * @returns the code block
 */
function buildAspectTryBlock(
  aspectName: string,
  key: string,
  argNames: string,
  errorMessage: string
) : string
{
  return `    try {
      __aspects__.${aspectName}.forEach(__aspect__ => {
        __aspect__.${key}.apply(this, ${argNames});
      });
    }
    catch (ex) {
      throw new AspectError("${errorMessage}", { cause: ex });
    }
  `;
}

// #endregion aspect class generation
