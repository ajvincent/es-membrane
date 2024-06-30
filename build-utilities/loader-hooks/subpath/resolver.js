import { getReplacement, buildReplacementMap } from "./replacement-map.js";
import { projectDir } from "../../internal/AsyncSpecModules.js";
import { SingletonPromise } from "../../internal/PromiseTypes.js";

const hookName = "subpath";

/** @type SingletonPromise<Map<RegExp, string | null>> */
const SubpathImportsPromise = new SingletonPromise(async () => {
  const packageLocation = path.join(projectDir, "package.json");
  const packageContents = JSON.parse(await fs.readFile(packageLocation, { encoding: "utf-8" }));
  return buildReplacementMap(packageContents.imports);
});

export async function initialize() {
}

async function logWithHook(...args) {
  console.log(hookName, ...args);
  await new Promise(resolve => setImmediate(resolve));
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("#")) {
    const replacementMap = await SubpathImportsPromise.run();
    const subpathImportMatch = await getReplacement(replacementMap, specifier);
    await logWithHook(specifier, subpathImportMatch);
    specifier = subpathImportMatch;
  }
  const result = await nextResolve(specifier, context);
  return Promise.resolve(result);
}

export async function load(url, context, nextLoad) {
  return await nextLoad(url, context);
}
