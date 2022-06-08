import { BuildPromiseSet } from "./utilities/BuildPromise.mjs";
import { Deferred } from "./utilities/PromiseTypes.mjs";

import { fork } from 'child_process';

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 * @returns {Promise<void>}
 * @see /build/tools/generateCollectionTools.mjs
 */
function runModule(pathToModule: string, moduleArgs: string[] = [], extraNodeArgs: string[] = []) {
  const d: Deferred<void> = new Deferred;

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs),
    silent: false
  });
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d;
}
void(runModule);

const BPSet = new BuildPromiseSet(true);

{ // test
  const target = BPSet.get("test");
  target.addTask(() => runModule("./node_modules/jasmine/bin/jasmine.js", [], []));
}


{ // debug
  const target = BPSet.get("debug");
  target.addTask(() => runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]));
}

BPSet.markReady();
export default BPSet;
