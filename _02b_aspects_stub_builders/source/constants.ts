import path from "path";
import { fileURLToPath } from "url";

export const stageDir = path.normalize(path.join(
  fileURLToPath(import.meta.url), "../.."
));
