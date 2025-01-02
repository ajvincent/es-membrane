/* eslint-disable no-undef */
import which from "which";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

export const execAsync = promisify(execFile);

const projectDir = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

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
