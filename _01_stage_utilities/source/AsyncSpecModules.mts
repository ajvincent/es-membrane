/**
 * These are utilities for asynchronously importing modules which may not exist until after the build completes.
 */

import path from "path";
import url from "url";

import type {
  Class
} from "type-fest";

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
export async function getModuleDefaultClassWithArgs<T extends unknown[], U>(
  source: ModuleSourceDirectory,
  leafName: string
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
export async function getModuleClassWithArgs<Key extends string, T extends unknown[], U>(
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

export function pathToModule(
  source: ModuleSourceDirectory,
  leafName: string,
) : string
{
  return path.normalize(path.resolve(
    url.fileURLToPath(source.importMeta.url),
    source.pathToDirectory,
    leafName
  ));
}
