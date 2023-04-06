// This code is already throw-away, as quick prototyping.

import path from "path";
import url from "url";
import fs from "fs/promises";

import type {
  SetReturnType,
} from "type-fest";

import type {
  ModuleSourceDirectory,
} from "../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

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
type AspectBuilder<T extends MethodsOnlyInternal> = new () => VoidMethodsOnly<T>;
export type AspectConstructorsDictionary<T extends MethodsOnlyInternal> = {
  [key in keyof AspectsDictionary<T>]: ReadonlyArray<AspectBuilder<T>>;
}

export class AspectError extends Error {
  readonly name = "AspectError";
}

// #endregion aspect types and helper classes

// #region build aspects dictionary


type AspectKeyDictionary<T extends MethodsOnlyInternal> = {
  [key in keyof AspectsDictionary<T>]: ReadonlyArray<string>
};

async function writeAspectsDictionary<T extends MethodsOnlyInternal>(
  typeFile: FileWithExport,
  absTargetPath: string,
  aspectsDir: ModuleSourceDirectory,
  useAspects: AspectKeyDictionary<T>,
) : Promise<string>
{
  const pathToAspects = getAbsolutePath({...aspectsDir, leafName: "", exportName: ""});
  const files = new Set(await fs.readdir(
    pathToAspects, { encoding: "utf-8" }
  ));

  const dicts: {
    [key in keyof AspectsDictionary<T>]: Set<string>
  } = {
    classInvariant: new Set
  };

  const imports = new Map<string, string>;
  useAspects.classInvariant.forEach(leaf => {
    if (!files.has(leaf + ".mts"))
      return;
    imports.set(leaf, path.join(pathToAspects, leaf + ".mjs"));
    dicts.classInvariant.add(leaf);
  });

  let rv = "";
  imports.forEach((pathToFile, leaf) => {
    rv += `import ${leaf} from "${getRelativePath(absTargetPath, pathToFile)}";\n`;
  });
  rv += "\n";

  rv += `
export const ASPECT_BUILDERS: AspectConstructorsDictionary<${typeFile.exportName}> = {
  classInvariant: [
    ${useAspects.classInvariant.join(",\n    ")}
  ],
};
  `.trim() + "\n\n";

  return rv;
}

// #endregion build aspects dictionary


// #region aspect class generation

type ArgParameter = [string, string];

type FileWithExport = ModuleSourceDirectory & {
  readonly leafName: string;
  readonly exportName: string;
}

const thisSourcePath = url.fileURLToPath(import.meta.url);

/**
 * This is a quick & dirty class generator for aspect-oriented programming.
 *
 * @param typeFile - the type file location and export name.
 * @param classFile - the base class file location and export name.
 * @param argDictionary - methodName: [[argName: argType]]
 * @param targetFile - the target class file location and export name.
 */
export async function buildAspectClassRaw<T extends MethodsOnlyInternal>
(
  typeFile: FileWithExport,
  classFile: FileWithExport,
  argDictionary: {
    [key: string] : ReadonlyArray<ArgParameter>
  },
  aspectsDir: ModuleSourceDirectory,
  useAspects: AspectKeyDictionary<T>,
  targetFile: FileWithExport,
) : Promise<void>
{
  const absTypeSourcePath  = getAbsolutePath(typeFile);
  const absClassSourcePath = getAbsolutePath(classFile);
  const absTargetPath = getAbsolutePath(targetFile);

  const methodsSource = Object.entries(argDictionary).map(
    ([key, args]) => buildAspectsMethod(typeFile.exportName, key, args)
  ).join("\n\n");

  const aspectBuilders = await writeAspectsDictionary<T>(
    typeFile,
    absTargetPath,
    aspectsDir,
    useAspects,
  );

  const fileContents = `
${buildPreamble(
  typeFile.exportName,
  classFile.exportName,
  absTargetPath,
  absTypeSourcePath,
  absClassSourcePath
)}

${aspectBuilders}

// #region aspect-oriented driver class

export abstract class ${targetFile.exportName}Abstract extends ${classFile.exportName}
{
  protected abstract [ASPECTS_KEY]: AspectsDictionary<${typeFile.exportName}>;

${methodsSource}
}

export class ${targetFile.exportName}_AspectBase implements VoidMethodsOnly<${typeFile.exportName}>
{${Object.entries(argDictionary).map(([key]) => {
    return `
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ${key}() : void {}
`;
}).join("")}}

// #endregion aspect-oriented driver class
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
 * @param typeName - the exported type name
 * @param className - the exported base class name.
 * @param absTargetPath - the absolute location of the target class file.
 * @param absTypeSourcePath - the absolute location of the type module.
 * @param absClassSourcePath - the absolute location of the base class module.
 * @returns the preamble source.
 */
function buildPreamble(
  typeName: string,
  className: string,
  absTargetPath: string,
  absTypeSourcePath: string,
  absClassSourcePath: string,
) : string
{
  return `
/* This file is generated.  Do not edit. */

// #region preamble
import {
  ASPECTS_KEY,
  type AspectsDictionary,
  AspectError,
  type VoidMethodsOnly,
  type AspectConstructorsDictionary,
} from "${
  getRelativePath(absTargetPath, thisSourcePath)
}";

import type { ${typeName} } from "${
  getRelativePath(absTargetPath, absTypeSourcePath)
}";
import ${className} from "${
  getRelativePath(absTargetPath, absClassSourcePath)
}";
// #endregion preamble
  `.trim();
}

function getRelativePath(
  absTargetPath: string,
  pathToImport: string
) : string
{
  return path.relative(path.dirname(absTargetPath), pathToImport);
}

/**
 * 
 * @param typeName - the type name to use.
 * @param fieldName - the method name.
 * @param args - the arguments with types.
 * @returns the aspect method's source code.
 */
function buildAspectsMethod(
  typeName: string,
  fieldName: string,
  args: readonly ArgParameter[]
) : string
{
  const argNames = `[${args.map(param => param[0]).join(", ")}]`;
  const argList = args.map(param => param.join(": "));
  return "  " + `
  ${fieldName}(${argList.join(", ")}): ReturnType<${typeName}["${fieldName}"]>
  {
    const __aspects__ = this[ASPECTS_KEY];

${buildAspectTryBlock(
  "classInvariant",
  fieldName,
  argNames,
  "class invariant failed on enter"
  )}
    const __rv__ = super.${fieldName}.apply(this, ${argNames});

${buildAspectTryBlock(
  "classInvariant",
  fieldName,
  argNames,
  "class invariant failed on leave"
  )}
    return __rv__;
  }
  `.trim();
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
