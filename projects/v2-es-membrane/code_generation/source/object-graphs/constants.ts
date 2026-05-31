import path from "path";
import { fileURLToPath } from "url";

export const stageDir = path.normalize(path.join(
  fileURLToPath(import.meta.url), "../../.."
));

export const generatedDirs: Record<string, string> = {
  raw: path.join(stageDir, "generated/raw/object-graphs"),
  prettified: path.join(stageDir, "generated/prettified/object-graphs"),
  final: path.join(stageDir, "generated/final/object-graphs"),
};
