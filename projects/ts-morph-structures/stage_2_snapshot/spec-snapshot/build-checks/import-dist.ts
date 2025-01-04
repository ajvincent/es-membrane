import fs from "fs/promises";
import path from "path";
import which from "which";
import { exec } from "child_process";
import { promisify } from "util";

import tempDirWithCleanup from "#utilities/source/tempDirWithCleanup.js";

import {
  ModuleSourceDirectory,
  pathToModule,
  projectDir
} from "#utilities/source/AsyncSpecModules.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  getTypeAugmentedStructure,
  VoidTypeNodeToTypeStructureConsole,
} from "#stage_two/snapshot/source/exports.js";

const execPromise = promisify(exec);

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../.."
};

const sourceDir = pathToModule(stageDir, "fixtures/import-dist");
const cleanup = await tempDirWithCleanup();
const targetDir = cleanup.tempDir;

// copy package files
{
  await fs.cp(sourceDir, targetDir, { recursive: true });
  await fs.cp(path.join(projectDir, "node_modules"), path.join(targetDir, "node_modules"), { recursive: true });
}

const npm = await which("npm");

it("Driver generates a valid set of classes", async () => {
  const DefaultMapModule = pathToModule(stageDir, "fixtures/stage_utilities/DefaultMap.ts");
  const DefaultMapSourceFile = getTS_SourceFile(stageDir, "fixtures/stage_utilities/DefaultMap.ts");
  const DefaultMapStructure = getTypeAugmentedStructure(
    DefaultMapSourceFile, VoidTypeNodeToTypeStructureConsole, true
  ).rootStructure;

  try {
    await execPromise(
      npm + " install " + projectDir,
      { cwd: targetDir }
    );

    const {stdout} = await execPromise(
      npm + " start " + DefaultMapModule,
      { cwd: targetDir }
    );

    expect(
      JSON.parse(stdout.substring(stdout.indexOf("{")))
    ).toEqual(JSON.parse(JSON.stringify(DefaultMapStructure)));
  }
  finally {
    cleanup.resolve(null);
    await cleanup.promise;
  }
}, 1000 * 60 * 60);
