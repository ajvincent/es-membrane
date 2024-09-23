import path from "node:path";

import {
  projectRoot
} from "./internal/constants.js";

import {
  series
} from "gulp";

import invokeTSC from "./invokeTSC.js";

async function runTests() {
  const {
    runJasmine
  } = await import("../dist/source/runJasmine.js");
  await runJasmine(path.join(projectRoot, "spec/support/jasmine.json"));
}

export default series(invokeTSC, runTests);
