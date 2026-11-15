// #region preamble
import fs from "fs/promises";

import {
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import BaseModule from "../moduleClasses/BaseModule.js";
import UnionModule from "../moduleClasses/UnionModule.js";

import {
  stageDir,
} from "./constants.js";

import createDecorators from "./decorators/createDecorators.js";
import createInterfaces from "./interfaces/createInterfaces.js";
import createStructures from "./structures/createStructures.js";
import { createIsStructureOfTypeModule } from "./structures/isStructureOfType.js";
import defineExistingExports from "./publicAndInternalExports.js";

const distDir = pathToModule(stageDir, "dist");

// #endregion preamble

async function cleanDist(): Promise<void>
{
  let found = false;
  try {
    await fs.access(distDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(distDir, { recursive: true });
}

export default async function buildDist(): Promise<void>
{
  await cleanDist();
  await fs.mkdir(distDir);

  const structureNames = UnionModule.fillAliases();
  await createInterfaces(structureNames);

  await Promise.all([
    UnionModule.saveFile(),
    createDecorators(),
    createStructures(),
    createIsStructureOfTypeModule(),
  ]);

  await defineExistingExports();

  await BaseModule.saveExports();
}
