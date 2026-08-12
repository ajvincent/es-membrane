import { performance } from "node:perf_hooks";

import {
  monorepoRoot
} from "@ajvincent/build-utilities";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

const start = performance.now();
const TS_MORPH_D = getTS_SourceFile({
  isAbsolutePath: true,
  pathToDirectory: monorepoRoot
}, "node_modules/ts-morph/lib/ts-morph.d.ts");
const end = performance.now();

export default TS_MORPH_D;

console.log("time to load ts-morph.d.ts: " + (end - start) + "ms");
