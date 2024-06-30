import { setImmediate } from "node:timers";

const hookName = "subpath";

export default async function logWithHook(...args) {
  console.log(hookName, ...args);
  await new Promise(resolve => setImmediate(resolve));
}
