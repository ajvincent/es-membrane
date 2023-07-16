/**
 * These are utilities for asynchronously importing modules which may not exist until after the build completes.
 */

import fs from "fs/promises";
import path from "path";
import url from "url";

const projectDir = path.normalize(path.resolve(
  url.fileURLToPath(import.meta.url),
  "../../.."
));
const pathToPackageJSON = path.join(projectDir, "package.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T extends object, Arguments extends unknown[] = any[]> = {
  prototype: T;
  new(...parameters: Arguments): T
};

interface PathToDirectory {
  pathToDirectory: string;
}

interface PathWithImportMeta extends PathToDirectory {
  importMeta: ImportMeta;
}

interface PathToAbsoluteDirectory extends PathToDirectory {
  isAbsolutePath: true;
}

export type ModuleSourceDirectory = (
  PathWithImportMeta |
  PathToAbsoluteDirectory
);

/**
 * @typeParam U - the type of the class's return value.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @returns the default export.
 */
export async function getModuleDefaultClass<U extends object>(
  source: ModuleSourceDirectory,
  leafName: string,
) : Promise<Class<U>>
{
  const module = (
    await import(pathToModule(source, leafName))
  ) as { default: Class<U> };
  return module.default;
}

/**
 * @typeParam T - the arguments to pass in.
 * @typeParam U - the type of the class's return value.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @returns the default export.
 */
export async function getModuleDefaultClassWithArgs<
  T extends unknown[],
  U extends object,
>
(
  source: ModuleSourceDirectory,
  leafName: string,
) : Promise<Class<U, T>>
{
  const module = (
    await import(pathToModule(source, leafName))
  ) as { default: Class<U, T> };
  return module.default;
}

/**
 * @typeParam Key - the exported part to pick up.
 * @typeParam T - the type of the module's part.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @param property - the exported part to pick up.
 * @returns the exported property.
 */
export async function getModulePart<Key extends string, T>(
  source: ModuleSourceDirectory,
  leafName: string,
  property: Key,
) : Promise<T>
{
  const module = (
    await import(pathToModule(source, leafName))
  ) as { [key in Key]: T }
  return module[property] as T;
}

/**
 * @typeParam Key - the exported part to pick up.
 * @typeParam T - the arguments to pass in.
 * @typeParam U - the type of the class's return value.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @param property - the exported part to pick up.
 * @returns the default export.
 */
export async function getModuleClassWithArgs<
  Key extends string,
  T extends unknown[],
  U extends object,
>
(
  source: ModuleSourceDirectory,
  leafName: string,
  property: Key,
) : Promise<Class<U, T>>
{
  const module = (
    await import(pathToModule(source, leafName))
  ) as { [key in Key]: Class<U, T> };
  return module[property];
}

const SubpathImportStart: [string, string][] = [];
{
  const packageFile = await fs.readFile(pathToPackageJSON, {encoding: "utf-8"});
  const packageJSON = JSON.parse(packageFile) as { imports: Record<string, string> };
  for (const [key, value] of Object.entries(packageJSON.imports)) {
    SubpathImportStart.push([key.replace(/\/\*$/, ""), value.replace(/\/\*$/, "")]);
  }
}

export function pathToModule(
  source: ModuleSourceDirectory,
  leafName: string,
) : string
{
  if ("isAbsolutePath" in source) {
    let pathToModuleFile = path.join(source.pathToDirectory, leafName);
    if (pathToModuleFile.startsWith("#")) {
      for (const [key, value] of SubpathImportStart) {
        if (pathToModuleFile.startsWith(key)) {
          pathToModuleFile = pathToModuleFile.replace(key, value);
          return path.normalize(path.resolve(
            projectDir,
            pathToModuleFile,
          ));
        }
      }
    }
    return pathToModuleFile;
  }

  return path.normalize(path.resolve(
    url.fileURLToPath(source.importMeta.url),
    source.pathToDirectory,
    leafName
  ));
}
