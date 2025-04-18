import path from "node:path";

import {
  asyncFork,
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

const projectRoot = path.join(monorepoRoot, "projects/search-references-host");

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

async function doRollup(): Promise<void>
{
  const rollupLocation = path.join(monorepoRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = path.join(projectRoot, "source", "rollup.config.js");
  await asyncFork(rollupLocation, [
      "--config",
      pathToConfig,
    ],
    path.join(projectRoot, "source")
  );
}


export default series([
  build,
  copyJasmineSupportJSON,
  jasmine,
  eslint,
  doRollup,
]);
