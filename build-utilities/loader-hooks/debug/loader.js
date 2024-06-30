import { URL } from "node:url";
import { setImmediate } from "node:timers";

const { searchParams } = new URL(import.meta.url);
const hookName = searchParams.get("hookName");
const includesFileMatch = searchParams.get("includesFileMatch");

export async function initialize() {
}

async function logWithHook(...args) {
  console.log(hookName, ...args);
  await new Promise(resolve => setImmediate(resolve));
}

export async function resolve(specifier, context, nextResolve) {
  // Take an `import` or `require` specifier and resolve it to a URL.
  await logWithHook(`resolve: ${specifier} parentURL: ${context.parentURL} (inbound)`);
  const result = await nextResolve(specifier, context);
  await logWithHook("resolve: " + specifier, "parentURL: " + context.parentURL, "result: " + result.url);
  return Promise.resolve(result);
}

export async function load(url, context, nextLoad) {
  await logWithHook("load begin: " + url);
  const result = await nextLoad(url, context);
  if (includesFileMatch && url.includes(includesFileMatch))
    await logWithHook("source: " + url + "\n" + result.source.toString());

  await logWithHook("load close: " + url);
  return result;
}
