import path from "node:path";
import { spawn } from 'child_process';

import { Deferred } from "./PromiseTypes.js";
import { projectDir } from "./AsyncSpecModules.js";

/**
 * Run a specific submodule.
 *
 * @param pathToModule  - The module to run.
 * @param moduleArgs    - Arguments we pass into the module.
 * @param extraNodeArgs - Arguments we pass to node.
 */
export function runModule(
  pathToModule: string,
  moduleArgs: string[] = [],
  extraNodeArgs: string[] = []
) : Promise<void>
{
  const d = new Deferred<void>;

  const env = {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? ""
  }
  env.NODE_OPTIONS += extraNodeArgs.join(" ");

  const nodeJSArgs = [
    /*
    "../node_modules/ts-node/dist/bin-esm.js",
    */
    ...extraNodeArgs,
    "--import",
    path.join(projectDir, "register-hooks.js"),

    "--expose-gc",
    pathToModule,
    ...moduleArgs,
  ];

  const child = spawn(
    "node",
    nodeJSArgs,
    {
      stdio: ["ignore", "inherit", "inherit", "ipc"],
      /*
      cwd: path.join(process.cwd(), path.dirname(pathToModule))
      */
    }
  );
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d.promise;
}
