import path from "node:path";

import {
  InvokeTSC,
  monorepoRoot,
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  parallel,
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

/*
async function jasmine_gc(): Promise<void> {
  try {
    console.log("Beginning garbage collection tests... these are unreliable, so a failure shouldn't block the build\n\n");
    await runJasmine("./dist/spec/support/jasmine-gc.json");
  }
  catch (ex) {
    console.error(ex);
  }
  finally {
    console.log("Garbage collection tests complete.  Failures beyond this point will not be ignored.\n\n");
  }
}
*/

async function eslint(): Promise<void> {
  await runESLint(projectRoot, [
    "Gulpfile.ts",
    //"fixtures/**/*.ts",
    "source/**/*.ts",
    "spec/**/*.ts",
  ]);
}

export default series([
  build,
  parallel(
    copyJasmineSupportJSON,
  ),
  jasmine,
  /*
  jasmine_gc,
  */
  eslint,
]);
