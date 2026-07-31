import path from "node:path";
import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

const targetDir: string = path.join(monorepoRoot, "docs/ts-morph-structures/api");
export { targetDir };
