import fs from "fs/promises";
import path from "path";

import ts from "ts-morph";

import {
  StaticValidator,
  BuildData,
  ComponentOrSequence,
  BodyComponentData,
  SequenceKeysData,
  PassiveComponentData,
} from "./ProjectJSON.mjs";
import ComponentClassGenerator from "./ComponentClassGenerator.mjs";

export default async function ProjectDriver(
  pathToProjectJSON: string,
  buildOptimized = false
) : Promise<ts.Project[]>
{
  let configs: ReadonlyArray<BuildData>;
  {
    const contents = JSON.parse(await fs.readFile(pathToProjectJSON, { encoding: "utf-8"}));
    if (!StaticValidator(contents))
      throw new Error("static validation failed");
    configs = contents;
  }

  return Promise.all(configs.map(
    buildData => OneProjectDriver(pathToProjectJSON, buildData, buildOptimized)
  ));
}

async function OneProjectDriver(
  pathToProjectJSON: string,
  config: BuildData,
  buildOptimized: boolean
) : Promise<ts.Project>
{
  const baseDir = path.dirname(pathToProjectJSON);
  function relPath(...parts: string[]) : string
  {
    return path.resolve(baseDir, ...parts);
  }

  const project: ts.Project = new ts.Project({
    compilerOptions: {
      lib: ["es2022"],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Node16,
      sourceMap: true,
      declaration: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    }
  });

  if (config.sourceDirectories) {
    config.sourceDirectories.forEach(
      dir => project.addDirectoryAtPath(relPath(dir))
    );
  }

  const generatorData = config.componentGenerator;

  const targetDir = relPath(generatorData.targetDirLocation);
  await fs.mkdir(targetDir, { recursive: true });

  const generator = new ComponentClassGenerator(
    project.addSourceFileAtPath(relPath(generatorData.sourceTypeLocation)),
    generatorData.sourceTypeAlias,
    project.addDirectoryAtPath(targetDir),
    generatorData.baseClassName,
    generatorData.entryTypeAlias
  );

  await generator.run();

  const entries = getProjectKeys(
    Object.entries(config.keys),
    buildOptimized,
    targetDir,
    relPath
  );
  await generator.addKeys(Object.fromEntries(entries));

  if (config.startComponent)
    await generator.setStartComponent(config.startComponent);

  return project;
}

type ComponentData = Exclude<ComponentOrSequence, SequenceKeysData>;
const DebugRoles: ReadonlySet<ComponentData["role"]> = new Set([ "precondition", "bodyAssert", "postcondition"]);

function getProjectKeys(
  entries: [string, ComponentOrSequence][],
  buildOptimized: boolean,
  targetDir: string,
  relPath: (...parts: string[]) => string,
) : [string, ComponentOrSequence][]
{
  const componentEntries = entries.filter(
    ([key, data]) => { void(key); return data.type === "component"; }
  ) as [string, ComponentData][];

  const debugComponentMap = new Map(componentEntries.filter(
    ([key, data]) => { void(key); return DebugRoles.has(data.role); }
  ));

  const keyEntries: [string, ComponentOrSequence][] = componentEntries.map(([key, componentData]) => {
    let componentPath = relPath(componentData.file);
    componentPath = path.relative(targetDir, componentPath);
    if (!componentPath.startsWith("."))
      componentPath = "./" + componentPath;

    const component: BodyComponentData | PassiveComponentData = {
      ...componentData,
      file: componentPath,
    };

    return [key, component];
  });

  let sequenceEntries = entries.filter(
    ([key, data]) => { void(key); return data.type === "sequence"; }
  ) as [string, SequenceKeysData][];

  if (buildOptimized) {
    const debugEntries = sequenceEntries;
    sequenceEntries = [];
    debugEntries.forEach(([key, data]) => {
      const optimizedSubkeys = data.subkeys.filter(subkey => !debugComponentMap.has(subkey));
      sequenceEntries.push(
        [key, {
          ...data,
          subkeys: optimizedSubkeys
        }]
      );
    });
  }

  keyEntries.push(...sequenceEntries);
  return keyEntries;
}
