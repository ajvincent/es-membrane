import { BuildPromiseSet } from "./utilities/BuildPromise.mjs";
import { Deferred } from "./utilities/PromiseTypes.mjs";
import InvokeTSC from "./utilities/InvokeTSC.mjs";
import readDirsDeep from "./utilities/readDirsDeep.mjs";

import fs from "fs/promises";
import path from "path";
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

const BPSet = new BuildPromiseSet(true);

class DirStage {
  #dir: string;
  #allDirs: string[];
  constructor(dir: string, allDirs: string[])
  {
    this.#dir = path.resolve(dir);
    this.#allDirs = allDirs;

    const subtarget = BPSet.get(dir);
    DirStage.#subtasks.forEach(subtask => subtarget.addSubtarget(dir + ":" + subtask));

    BPSet.get(dir + ":tsc").addTask(async () => await this.#runTSC());
    BPSet.get(dir + ":build").addTask(async () => await this.#runBuild());
  }

  async #runTSC() : Promise<void>
  {
    let { files } = await readDirsDeep(this.#dir);
    files = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    if (files.length === 0)
      return;

    const result = await InvokeTSC.withCustomConfiguration(
      path.join(this.#dir, "tsconfig.json"),
      true,
      (config) => {
        config.files = files;
        config.extends = "@tsconfig/node16/tsconfig.json";
      },
      path.resolve(this.#dir, "ts-stdout.txt")
    );
    if (result !== 0)
      throw new Error("runTSC failed with code " + result);
  }

  async #runBuild() : Promise<void>
  {
    const pathToModule = path.resolve(this.#dir, "build", "support.mjs");
    try {
      await fs.access(pathToModule);
    }
    catch (ex) {
      // do nothing
      void(ex);
      return;
    }

    const buildNext = (await import(pathToModule)).default;
    await buildNext(this.#allDirs);
  }

  static readonly #subtasks = ["tsc", "build"];

  static buildTask(dir: string, allDirs: string[]) : DirStage
  {
    const target = BPSet.get("stages");
    target.addSubtarget(dir);

    return new DirStage(dir, allDirs);
  }
}

{ // (stages)
  const target = BPSet.get("stages");
  let dirEntries = await fs.readdir(path.resolve(), { encoding: "utf-8", withFileTypes: true });
  dirEntries = dirEntries.filter(entry => {
    if (!entry.isDirectory())
      return false;
    return /^_\d+\_/.test(entry.name);
  });

  const dirs = dirEntries.map(ent => ent.name);
  dirs.sort();

  dirs.forEach((dir, index) => DirStage.buildTask(dir, dirs.slice(index + 1)));
}

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
