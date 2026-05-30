import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  series
} from "gulp";

import {
  runJasmine,
  runESLint,
} from "@ajvincent/build-utilities";

const stageDir = path.normalize(path.resolve(
  fileURLToPath(import.meta.url),
  ".."
));

async function internalTests(): Promise<void> {
  return runJasmine("./spec/support/jasmine.json");
}

async function eslint(): Promise<void> {
  await runESLint(stageDir, [
    "Gulpfile.ts",
    "canaries/*.ts",
    "fixtures/**/*.ts",
    "spec/**/*.ts",
  ]);
}

export default series([
  internalTests,
  eslint,
]);
