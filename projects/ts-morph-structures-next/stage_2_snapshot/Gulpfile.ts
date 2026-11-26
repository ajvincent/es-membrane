import path from "node:path";

import {
  asyncFork,
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  series
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import {
  snapshotDir,
} from "./pre-build/constants.js";

async function madge(): Promise<void> {
  // node ./node_modules/madge/bin/cli.js --circular --extensions ts source/
  const madgeLocation = path.join(projectDir, "node_modules/madge/bin/cli.js");
  console.log(madgeLocation);
  await asyncFork(
    madgeLocation,
    [
      "--circular",
      "--extensions",
      "ts",
      "source"
    ],

    snapshotDir
  );
}

async function jasmine(): Promise<void> {
  await runJasmine("./spec-snapshot/support/jasmine.json");
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_2_snapshot"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    // "fixtures/**/*.ts",
    "snapshot/source/**/*.ts",
    "spec-snapshot/**/*.ts",
    "utilities/**/*.ts",
  ]);
}

export default series([
  madge,
  jasmine,
  eslint,
]);
