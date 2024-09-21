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
  return Promise.reject(new Error("disabled, can you do this some other way?"));
}

/*
import path from "node:path";
import { spawn } from 'child_process';

import { Deferred } from "../internal/PromiseTypes.js";
import { projectDir } from "../internal/AsyncSpecModules.js";

export function runModule(
  pathToModule: string,
  moduleArgs: string[] = [],
  extraNodeArgs: string[] = []
) : Promise<void>
{
  return Promise.reject(new Error("disabled, can you do this some other way?"));
  const d = new Deferred<void>;

  const env = {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? ""
  }
  env.NODE_OPTIONS += extraNodeArgs.join(" ");

  extraNodeArgs = extraNodeArgs.slice();

  const moduleHookImports = [
    //"./build-utilities/loader-hooks/debug/registration.js?hookName=one",
    "./register-hooks.js",
    //"./node_modules/tsimp/dist/esm/hooks/import.mjs",
    //"./build-utilities/loader-hooks/debug/registration.js?hookName=two",
    //"./build-utilities/loader-hooks/subpath/registration.js",
    //"./build-utilities/loader-hooks/debug/registration.js?hookName=three",
  ];

  for (const registrar of moduleHookImports) {
    extraNodeArgs.push("--import", path.resolve(projectDir, registrar));
  }
  extraNodeArgs.push("--trace-uncaught");

  const nodeJSArgs = [
    ...extraNodeArgs,

    "--expose-gc",
    pathToModule,
    ...moduleArgs,
  ];

  const child = spawn(
    "node",
    nodeJSArgs,
    {
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    }
  );
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d.promise;
}
*/
