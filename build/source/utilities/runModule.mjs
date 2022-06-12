import { Deferred } from "./PromiseTypes.mjs";
import { fork } from 'child_process';
/**
 * Run a specific submodule.
 *
 * @param pathToModule  - The module to run.
 * @param moduleArgs    - Arguments we pass into the module.
 * @param extraNodeArgs - Arguments we pass to node.
 * @see /build/tools/generateCollectionTools.mjs
 */
export function runModule(pathToModule, moduleArgs = [], extraNodeArgs = []) {
    const d = new Deferred;
    const child = fork(pathToModule, moduleArgs, {
        execArgv: process.execArgv.concat(...extraNodeArgs),
        silent: false
    });
    child.on('exit', code => code ? d.reject(code) : d.resolve());
    return d.promise;
}
//# sourceMappingURL=runModule.mjs.map