import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const distDir = path.normalize(path.join(
  fileURLToPath(import.meta.url), "../../dist"
));

export async function clean() {
  return fs.rm(distDir, { recursive: true, force: true });
}
