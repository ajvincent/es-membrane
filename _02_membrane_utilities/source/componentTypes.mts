import path from "path";
import url from "url";
import fs from "fs/promises";

import {
  type ModuleSourceDirectory,
  getModulePart,
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import {
  PromiseAllParallel
} from "../../_01_stage_utilities/source/PromiseTypes.mjs";

import { ASPECT_TYPE } from "./aspectSymbols.mjs";

type AspectKnownType = (
  "debug" | // VoidMethodsOnly
  "checkArgs" | // VoidMethodsOnly
  "checkReturn" | // MethodsPrependReturn
  "mainBody" | // BodyContinuableOnly
  never
);

type AspectType = "unknown" | AspectKnownType;

export type ClassAspectType<T extends AspectType = AspectType> = {
  readonly [ASPECT_TYPE]: T;
}

export function isClassAspectOfType<
  T extends AspectKnownType
>
(
  _class: unknown,
  type: T | (AspectKnownType extends T ? "any" : never)
) : _class is ClassAspectType<T> & Function
{
  let componentType: AspectType = "unknown";
  if (typeof _class === "function") {
    componentType = (_class as unknown as ClassAspectType)[ASPECT_TYPE] ?? "unknown";
  }

  if (type === "any")
    return componentType !== "unknown";

  return componentType === type;
}

export async function readAspectFiles(
  sourceContext: ModuleSourceDirectory,
) : Promise<Map<string, ClassAspectType<AspectKnownType>>>
{
  const componentsDir = path.join(
    url.fileURLToPath(sourceContext.importMeta.url),
    sourceContext.pathToDirectory,
    "aspects"
  );

  let files: string[];
  {
    const rawFiles = await fs.readdir(componentsDir, {
      "encoding": "utf-8",
      "withFileTypes": false
    });
    files = rawFiles.filter(f => /(?<!\.d)\.mts$/.test(f));
    files.sort();
  }

  const rv = new Map<string, ClassAspectType<AspectKnownType>>;

  await PromiseAllParallel(files, async pathToFile => {
    const module = await getModulePart<"default", unknown>(
      sourceContext,
      path.join("aspects", pathToFile),
      "default"
    );

    if (!isClassAspectOfType<AspectKnownType>(module, "any"))
      return;

    rv.set(pathToFile.replace(/\.mts$/, ""), module);
  });

  return rv;
}
