import { Deferred } from "./PromiseTypes.mjs";
import { fork } from 'child_process';

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
  const d: Deferred<void> = new Deferred;

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat(...extraNodeArgs),
    silent: false
  });
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d.promise;
}
