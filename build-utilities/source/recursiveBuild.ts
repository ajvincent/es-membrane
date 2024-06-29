import path from "path";
import { spawn } from "child_process";
import { env } from "process";

import { Deferred } from "../internal/PromiseTypes.js";

export default async function recursiveBuild(
  dirname: string,
  relativePathToModule: string,
): Promise<void>
{
  const d = new Deferred<void>;

  const nodeJSArgs = [
    /*
    "../node_modules/ts-node/dist/bin-esm.js",
    */
    "--import",
    "../register-hooks.js",

    "--expose-gc",
    relativePathToModule
  ];

  if (dirname === env.TSMS_DEBUG) {
    nodeJSArgs.unshift("--inspect-brk");
  }

  const child = spawn(
    "node",
    nodeJSArgs,
    {
      stdio: ["ignore", "inherit", "inherit", "ipc"],
      cwd: path.join(process.cwd(), dirname)
    }
  );
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d.promise;
}
