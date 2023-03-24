import path from "path";
import url from "url";
import fs from "fs/promises";

import type {
  ModuleSourceDirectory,
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import { COMPONENT_TYPE } from "./componentSymbols.mjs";

type ComponentKnownType = (
  "debug" |
  "checkArgs" |
  "checkReturn" |
  "mainBody" |
  never
);

type ComponentType = "unknown" | ComponentKnownType;

export type ClassComponentType<T extends ComponentType = ComponentType> = {
  readonly [COMPONENT_TYPE]: T;
}

export function isClassComponentOfType<
  T extends ComponentKnownType
>
(
  _class: unknown,
  type: T | (ComponentKnownType extends T ? "any" : never)
) : _class is ClassComponentType<T> & Function
{
  let componentType: ComponentType = "unknown";
  if (typeof _class === "function") {
    componentType = (_class as unknown as ClassComponentType)[COMPONENT_TYPE] ?? "unknown";
  }

  if (type === "any")
    return componentType !== "unknown";

  return componentType === type;
}

export async function readComponentFiles(
  sourceContext: ModuleSourceDirectory,
) : Promise<Map<string, ClassComponentType<ComponentKnownType>>>
{
  const componentsDir = path.join(
    url.fileURLToPath(sourceContext.importMeta.url),
    sourceContext.pathToDirectory,
    "components"
  );

  let files: Set<string>;
  {
    const rawFiles = await fs.readdir(componentsDir, { "encoding" : "utf-8", "withFileTypes": false});
    files = new Set(
      rawFiles.filter(f => /(?<!\.d)\.mts$/.test(f))
              .map(f => path.join(componentsDir, f))
    );
  }

  void(files);

  const rv = new Map<string, ClassComponentType<ComponentKnownType>>;
  void(rv);

  throw new Error("not yet there");
}
