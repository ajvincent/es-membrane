/* eslint-disable no-undef */
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import which from "which";

export const execAsync = promisify(execFile);

const projectDir = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

const git: string = await which("git");

export async function assertRepoIsClean(): Promise<void> {
  const child = await execAsync(
    git,
    ["status", "-s"],
    { cwd: projectDir }
  );
  
  if (child.stderr) {
    console.log(child.stderr);
  }
  
  if (child.stdout.trim()) {
    throw new Error("repository is not clean:\n" + child.stdout);
  }
}
