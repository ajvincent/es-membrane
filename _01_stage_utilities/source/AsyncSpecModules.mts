/**
 * These are utilities for asynchronously importing modules which may not exist until after the build completes.
 */

import path from "path";
import url from "url";

export type ModuleSourceDirectory = {
  importMeta: ImportMeta;
  pathToDirectory: string;
};
 
/**
 * @typeParam U - the type of the class's return value.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @returns the default export.
 */
export async function getModuleDefaultClass<U>(
  source: ModuleSourceDirectory,
  leafName: string
) : Promise<{ new() : U }>
{
  return (await import(pathToModule(source, leafName))).default;
}

/**
 * @typeParam T - the arguments to pass in.
 * @typeParam U - the type of the class's return value.
 * @param source - the source metadata.
 * @param leafName - the module filename.
 * @returns the default export.
 */
export async function getModuleDefaultClassWithArgs<T extends unknown[], U>(
  source: ModuleSourceDirectory,
  leafName: string
) : Promise<{ new(...args: T) : U }>
{
  return (await import(pathToModule(source, leafName))).default;
}

  /**
  * @typeParam T - the type of the module's part.
  * @param source - the source metadata.
  * @param leafName - the module filename.
  * @param property - the exported part to pick up.
  * @returns the default export.
  */
export async function getModulePart<T>(
  source: ModuleSourceDirectory,
  leafName: string,
  property: string
) : Promise<T>
{
  return (await import(pathToModule(source, leafName)))[property] as T;
}
 
function pathToModule(source: ModuleSourceDirectory, leafName: string) : string
{
  return path.resolve(
    url.fileURLToPath(source.importMeta.url),
    source.pathToDirectory,
    leafName
  );
}
