import path from "path";
import { fileURLToPath } from "url";

export const stageDir = path.normalize(path.join(
  fileURLToPath(import.meta.url), "../.."
));

export const generatedDirs: Record<string, string> = {
  raw: path.join(stageDir, "generated/raw"),
  prettified: path.join(stageDir, "generated/prettified"),
  final: path.join(stageDir, "generated/final"),
};
