import path from "node:path";
import fs from "node:fs/promises";

import { getReplacement, buildReplacementMap } from "./replacement-map.js";
import { projectDir } from "../../internal/AsyncSpecModules.js";
import { SingletonPromise } from "../../internal/PromiseTypes.js";
/*
import logWithHook from "./logWithHook.js";
*/

/** @type SingletonPromise<Map<RegExp, string | null>> */
const SubpathImportsPromise = new SingletonPromise(async () => {
  const packageLocation = path.join(projectDir, "package.json");
  const packageContents = JSON.parse(await fs.readFile(packageLocation, { encoding: "utf-8" }));
  return buildReplacementMap(packageContents.imports);
});

export async function initialize() {
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("#")) {
    const replacementMap = await SubpathImportsPromise.run();
    const subpathImportMatch = await getReplacement(replacementMap, specifier, context.parentURL);
    specifier = subpathImportMatch;
  }
  const result = await nextResolve(specifier, context);
  return Promise.resolve(result);
}

export async function load(url, context, nextLoad) {
  return await nextLoad(url, context);
}
