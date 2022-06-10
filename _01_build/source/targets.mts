import { BuildPromiseSet } from "./utilities/BuildPromise.mjs";
import { Deferred, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";
import InvokeTSC from "./utilities/InvokeTSC.mjs";
import readDirsDeep from "./utilities/readDirsDeep.mjs";

import fs from "fs/promises";
import path from "path";
import { fork } from 'child_process';

let stageDirs: string[];
{
  const root = path.resolve();
  let dirEntries = await fs.readdir(root, { encoding: "utf-8", withFileTypes: true });
  dirEntries = dirEntries.filter(entry => {
    if (!entry.isDirectory())
      return false;
    if (!/^_\d+_/.test(entry.name))
      return false;
    return true;
  });

  stageDirs = dirEntries.map(ent => ent.name);
  stageDirs.sort();

  stageDirs = await PromiseAllParallel(stageDirs, async leaf => {
    const fullPath = path.join(root, leaf);
    const entries = await fs.readdir(fullPath);
    return entries.length > 0 ? leaf : "";
  });

  stageDirs = stageDirs.filter(Boolean);
}

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 * @returns {Promise<void>}
 * @see /build/tools/generateCollectionTools.mjs
 */
function runModule(
  pathToModule: string,
  moduleArgs: string[] = [],
  extraNodeArgs: string[] = []
) : Promise<void>
{
  const d: Deferred<void> = new Deferred;

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs),
    silent: false
  });
  child.on('exit', code => code ? d.reject(code) : d.resolve());

  return d.promise;
}

const BPSet = new BuildPromiseSet(true);

class DirStage
{
  #dir: string;
  #allDirs: string[];
  constructor(dir: string, allDirs: string[])
  {
    this.#dir = path.resolve(dir);
    this.#allDirs = allDirs;

    const subtarget = BPSet.get(dir);
    DirStage.#subtasks.forEach(subtask => subtarget.addSubtarget(dir + ":" + subtask));

    BPSet.get("clean").addSubtarget(dir + ":clean");

    BPSet.get(dir + ":clean").addTask(async () => await this.#clean());
    BPSet.get(dir + ":tsc").addTask(async () => await this.#runTSC());
    BPSet.get(dir + ":build").addTask(async () => await this.#runBuild());
  }

  async #clean() : Promise<void>
  {
    const isBuildDir = this.#dir.includes("/_01_build");
    let { files } = await readDirsDeep(this.#dir);
    files = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    if (files.length === 0)
      return;

    files = files.flatMap(f => {
      return [
        !isBuildDir || f.includes("/_01_build/spec/") ? f.replace(".mts", ".mjs") : "",
        f.replace(".mts", ".mjs.map"),
        f.replace(".mts", ".d.mts"),
      ];
    }).filter(Boolean);
    files.sort();

    await PromiseAllParallel(files, f => fs.rm(f, { force: true}));
  }

  async #runTSC() : Promise<void>
  {
    let { files } = await readDirsDeep(this.#dir);
    files = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    if (files.length === 0)
      return;

    const result = await InvokeTSC.withCustomConfiguration(
      path.join(this.#dir, "tsconfig.json"),
      false,
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

  static readonly #subtasks = ["clean", "tsc", "build"];

  static buildTask(dir: string, allDirs: string[]) : DirStage
  {
    const target = BPSet.get("stages");
    target.addSubtarget(dir);

    return new DirStage(dir, allDirs);
  }
}

{ // clean
  void(BPSet.get("clean"));
  const stages = BPSet.get("stages");
  stages.addSubtarget("clean");
}

{ // stages
  BPSet.get("stages");
  stageDirs.forEach((dir, index) => DirStage.buildTask(dir, stageDirs.slice(0, index)));
}

{ // test
  const target = BPSet.get("test");
  target.addSubtarget("stages");
  target.addTask(async () => await runModule("./node_modules/jasmine/bin/jasmine.js", [], []));
}

{ // debug
  const target = BPSet.get("debug");
  target.addTask(async () => await runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]));
}

{ // eslint
  const target = BPSet.get("eslint");
  target.description = "eslint support";
  const args = [
    "--max-warnings=0"
  ];

  const dirs = await PromiseAllParallel(stageDirs, async (stageDir) => {
    const { files } = await readDirsDeep(path.resolve(stageDir));
    return files.some(f => f.endsWith(".mjs")) ? stageDir : ""
  });
  args.push(...dirs.filter(Boolean));

  target.addTask(
    async () => await runModule("./node_modules/eslint/bin/eslint.js", args)
  );
}

{ // typescript:eslint
  const jsTarget = BPSet.get("eslint");
  jsTarget.addSubtarget("typescript:eslint");

  const target = BPSet.get("typescript:eslint");

  const args = [
    "-c", "./.eslintrc-typescript.json",
    "--max-warnings=0",
  ];

  const dirs = await PromiseAllParallel(stageDirs, async (stageDir) => {
    const { files } = await readDirsDeep(path.resolve(stageDir));
    return files.some(f => f.endsWith(".mts")) ? stageDir : ""
  });
  args.push(...dirs.filter(Boolean));

  console.log("./node_modules/eslint/bin/eslint.js", ...args);

  target.addTask(
    async () => {
      await runModule("./node_modules/eslint/bin/eslint.js", args);
    }
  );
}

BPSet.markReady();
export default BPSet;
