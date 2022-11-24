import fs from "fs/promises";
import path from "path";

import ts from "ts-morph";

import {
  StaticValidator,
  BuildData,
  PassiveComponentData,
  BodyComponentData,
  SequenceKeysData,
} from "./ProjectJSON.mjs";
import ComponentClassGenerator from "./ComponentClassGenerator.mjs";

export default async function ProjectDriver(
  pathToProjectJSON: string
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
    buildData => OneProjectDriver(pathToProjectJSON, buildData)
  ));
}

async function OneProjectDriver(
  pathToProjectJSON: string,
  config: BuildData
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

  // Build the component map's keys.
  const entries: [string, SequenceKeysData | PassiveComponentData | BodyComponentData][] = Object.entries(config.keys).map(
    ([key, componentOrSequence]) => {
      if (componentOrSequence.type === "sequence") {
        return [key, componentOrSequence];
      }

      let componentPath = relPath(componentOrSequence.file);
      componentPath = path.relative(targetDir, componentPath);
      if (!componentPath.startsWith("."))
        componentPath = "./" + componentPath;

      const component: BodyComponentData = {
        type: "component",
        file: componentPath,
        "setReturn": "may",
        "role": "body"
      };
      return [key, component];
    }
  );
  await generator.addKeys(Object.fromEntries(entries));

  if (config.startComponent)
    await generator.setStartComponent(config.startComponent);

  return project;
}
