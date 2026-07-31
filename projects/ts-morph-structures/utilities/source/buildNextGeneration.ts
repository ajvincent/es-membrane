import fs from "node:fs/promises";
import path from "node:path";

import {
  projectDir
} from "./AsyncSpecModules.js";

import {
  PromiseAllParallel
} from "./PromiseTypes.js";

const copyOptions = { recursive: true };

export async function buildNextGeneration(): Promise<void> {
  await fs.mkdir(path.join(projectDir, "next-generation"));

  const rawFiles = [
    "gulp-utilities",
    "node_modules",
    "stage_0_references",
    "stage_3_documentation",
    "use-cases",
    "utilities",
    ".gitignore",
    "clean.ts",
    "eslint.config.mjs",
    "Gulpfile.ts",
    "package.json",
    "README.md",
    "tsconfig-gulp.json",
    "tsconfig.json",
  ];

  await Promise.all([
    copyProjectDir("stage_2", "generation"),
    copyProjectDir("stage_2", "integration"),
    copySnapshotDir("stage_2_snapshot", "stage_1_snapshot"),
    copyProjectDir("stage_3", "generation"),
    copyProjectDir("stage_3", "integration"),
    copySnapshotDir("stage_3_snapshot", "stage_2_snapshot"),
    copySnapshotDir("stage_3_snapshot", "stage_3_snapshot"),
    ...rawFiles.map(f => fs.cp(
      path.join(projectDir, f),
      path.join(projectDir, "next-generation", f),
      copyOptions
    )),
  ]);
}

async function copyProjectDir(
  stage: "stage_2" | "stage_3",
  dirPostfix: "generation" | "integration",
): Promise<void>
{

  const sourceDir = path.join(projectDir, "stage_3_" + dirPostfix);
  const targetDir: string = path.join(projectDir, "next-generation", stage + dirPostfix);

  await fs.cp(
    sourceDir, targetDir, copyOptions
  );

  /*
  if (isGeneration === false) {
    // update docs target dir
    const targetDirConstFile: string = path.join(targetDir, "build/docs/targetDir.ts");
    await fs.writeFile(targetDirConstFile, `
import path from "node:path";
import {
  projectDir
} from "./AsyncSpecModules.js";

const targetDir: string = path.join(projectDir, "next-generation/ts-morph-structures/api");
export { targetDir };
    `.trim());
  }
  */

  if (stage === "stage_3")
    return;

  const allTSFiles: readonly string[] = (
    await fs.readdir(targetDir, { recursive: true })
  ).filter(f => f.endsWith(".ts"));
  await PromiseAllParallel(allTSFiles, f => replaceStageRef(targetDir, f));
}

async function replaceStageRef(
  targetDir: string,
  tsFile: string
): Promise<void>
{
  tsFile = path.join(targetDir, tsFile);
  let contents = await fs.readFile(tsFile, { encoding: "utf-8" });
  contents = contents.replaceAll("#stage_two/", "#stage_one/");
  contents = contents.replaceAll("stage_2_", "stage_1_");
  contents = contents.replaceAll("#stage_three/", "#stage_two/");
  contents = contents.replaceAll("stage_3_", "stage_2_");
  await fs.writeFile(tsFile, contents, { encoding: "utf-8" });
}

async function copySnapshotDir(
  sourceDir: string,
  targetDir: string
): Promise<void>
{
  sourceDir = path.join(projectDir, sourceDir);
  targetDir = path.join(projectDir, "next-generation", targetDir);

  const filesToCopy = [
    "build",
    "snapshot",
    "fixtures",
    ".gitignore",
    "eslint.config.mjs",
    "Gulpfile.ts",
    "README.md",
    "tsc-excludes.json",
  ];

  await PromiseAllParallel(filesToCopy, f => fs.cp(
    path.join(sourceDir, f),
    path.join(targetDir, f),
    copyOptions
  ));
}
