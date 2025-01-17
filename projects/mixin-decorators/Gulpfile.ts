//import fs from "node:fs/promises";
import path from "node:path";

import {
  fileURLToPath
} from "node:url";

import {
  InvokeTSC,
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  parallel,
  series,
  src,
  dest
} from "gulp";

const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), ".."));

async function build(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig.json"), []);
}

async function jasmine(): Promise<void> {
  await runJasmine("./dist/spec/support/jasmine.json");
}

async function eslint(): Promise<void> {
  await runESLint(projectRoot, [
    "Gulpfile.ts",
    "fixtures/**/*.ts",
    "source/**/*.ts",
    "spec/**/*.ts",
  ]);
}

export default series([
  build,
  parallel(
    () => src(
      ["source/exports.d.ts"],
    ).pipe(dest("dist/source/")),
    () => src(
      "source/types/**",
    ).pipe(dest("dist/source/types/")),
    () => src(
      "spec/support/jasmine.json",
    ).pipe(dest("dist/spec/support/")),
  ),
  jasmine,
  eslint,
]);
