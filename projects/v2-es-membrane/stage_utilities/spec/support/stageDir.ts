import path from "node:path";
import { fileURLToPath } from "node:url";

const stageDir: string = path.normalize(path.join(
  fileURLToPath(import.meta.url), "../../../"
));
export { stageDir };
