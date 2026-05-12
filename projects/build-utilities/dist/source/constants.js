import path from "node:path";
import { fileURLToPath, } from "node:url";
export const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), "../../.."));
export const monorepoRoot = path.normalize(path.join(projectRoot, "../.."));
export const TYPESCRIPT_LIBS_PATH = path.normalize(path.join(monorepoRoot, "node_modules/typescript/lib"));
