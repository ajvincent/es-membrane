import which from "which";
import { execFile } from "child_process";
import { promisify } from "util";

export const execAsync = promisify(execFile);

import {
  projectDir
} from "./AsyncSpecModules.js";

const git = await which("git");

const child = await execAsync(
  git,
  ["status", "-s"],
  { cwd: projectDir }
);

if (child.stderr) {
  console.log(child.stderr);
}

if (child.stdout.trim()) {
  console.log("repository is not clean:");
  console.log(child.stdout);
  process.exit(1);
}
