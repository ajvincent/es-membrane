import fs from "fs/promises";
import path from "path";
import { projectDir } from "#utilities/source/AsyncSpecModules.js";
import { PromiseAllParallel } from "#utilities/source/PromiseTypes.js";

const gitIgnorePath = path.join(projectDir, ".gitignore");
const gitIgnoreDirs: string[] = (
  await fs.readFile(gitIgnorePath, { encoding: "utf-8" })
).split("\n").filter(d => d.startsWith("stage_"));

await PromiseAllParallel(
  gitIgnoreDirs,
  dir => fs.rm(dir, { recursive: true, force: true })
);
