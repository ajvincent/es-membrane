import path from "node:path";

import {
  InvokeTSC,
  monorepoRoot,
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  series,
  src,
  dest
} from "gulp";

const projectRoot = path.join(monorepoRoot, "projects/reference-tracking");

async function build(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig.json"), []);
}

function copyJasmineSupportJSON() {
  return src(
    "spec/support/jasmine*.json",
  ).pipe(dest("dist/spec/support/"))
}

async function jasmine(): Promise<void> {
  await runJasmine("./dist/spec/support/jasmine.json");
}

async function eslint(): Promise<void> {
  await runESLint(projectRoot, [
    "Gulpfile.ts",
    "fixtures/**/*.ts",
    "reference-spec/**/*.ts",
    "source/**/*.ts",
    "spec/**/*.ts",
  ]);
}

export default series([
  build,
  copyJasmineSupportJSON,
  jasmine,
  eslint,
]);
