import fs from "fs/promises";

import buildAspectsDictionary from "#aspects/dictionary_build/source/buildAspectsDictionary.mjs";
import {
  ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

export default
async function runModule() : Promise<void>
{
  const moduleDirectory: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../source/generated"
  };

  const destinationDir = pathToModule(moduleDirectory, "");

  let found = false;

  try {
    await fs.access(destinationDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(destinationDir, { recursive: true });

  await buildAspectsDictionary(moduleDirectory);
}
