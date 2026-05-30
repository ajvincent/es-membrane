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
    "pre-build/**/*.ts",
    "references/**/*.ts",
    "source/decorators/**/*.ts",
    "source/exceptions/**/*.ts",
    "source/types/**/*.ts",
    "source/*.ts",
    "spec/**/*.ts",
    "Gulpfile.ts",
  ]);
}

export default series([
  internalTests,
  eslint
]);
