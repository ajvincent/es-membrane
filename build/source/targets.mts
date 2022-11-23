import { BuildPromiseSet } from "./utilities/BuildPromise.mjs";
import { PromiseAllParallel, PromiseAllSequence } from "./utilities/PromiseTypes.mjs";
import { runModule } from "./utilities/runModule.mjs";
import InvokeTSC from "./utilities/InvokeTSC.mjs";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
import tempDirWithCleanup from "./utilities/tempDirWithCleanup.mjs";

import fs from "fs/promises";
import path from "path";

let stageDirs: string[];
{
  const root = path.resolve();
  let dirEntries = await fs.readdir(root, { encoding: "utf-8", withFileTypes: true });
  dirEntries = dirEntries.filter(entry => {
    if (!entry.isDirectory())
      return false;
    if (!/^_\d\d*[a-z]?_/.test(entry.name))
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

const BPSet = new BuildPromiseSet(true);

class DirStage
{
  #dir: string;
  constructor(dir: string)
  {
    this.#dir = path.resolve(dir);

    BPSet.get(dir + ":clean").addTask(async () => await this.#clean());
    BPSet.get(dir + ":build").addTask(async () => await this.#runBuild());
    BPSet.get(dir + ":tsc").addTask(async () => await this.#runTSC());
    BPSet.get(dir + ":spec-build").addTask(async () => await this.#specBuild());
  }

  addSubtargets(dir: string) {
    const subtarget = BPSet.get(dir);
    DirStage.#subtasks.forEach(subtask => subtarget.addSubtarget(dir + ":" + subtask));
  }

  async #clean() : Promise<void>
  {
    const isBuildDir = this.#dir.includes("/build");
    const { files } = await readDirsDeep(this.#dir);

    let generatedFiles = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    if (generatedFiles.length === 0)
      return;

    generatedFiles = generatedFiles.flatMap(f => {
      return [
        !isBuildDir || f.includes("/build/spec/") ? f.replace(".mts", ".mjs") : "",
        f.replace(".mts", ".mjs.map"),
        f.replace(".mts", ".d.mts"),
      ];
    }).filter(Boolean);

    generatedFiles.push(...files.filter(f => {
      const leafName = path.basename(f);
      return (leafName === "ts-stdout.txt") || (leafName === "tsconfig.json");
    }));

    generatedFiles.sort();

    await PromiseAllParallel(generatedFiles, f => fs.rm(f, { force: true}));

    let found = false;
    const generatedDir = path.resolve(this.#dir, "generated");
    try {
      await fs.access(generatedDir);
      found = true;
    }
    catch {
      // do nothing
    }
    if (found)
      await fs.rm(generatedDir, { recursive: true });

    found = false;
    const specGeneratedDir = path.resolve(this.#dir, "spec-generated");

    try {
      await fs.access(specGeneratedDir);
      found = true;
    }
    catch {
      // do nothing
    }
    if (found)
      await fs.rm(specGeneratedDir, { recursive: true });
  }

  async #runTSC() : Promise<void>
  {
    let excludeSpecBuild = true;
    {
      const pathToMTS = path.resolve(this.#dir, "spec-build", "support.mts");

      try {
        await fs.access(pathToMTS);
        excludeSpecBuild = false;
      }
      catch (ex) {
        // do nothing
        void(ex);
      }
    }

    const excludedDirs = new Set(["build", "spec-generated"]);
    if (excludeSpecBuild)
      excludedDirs.add("spec-build");
    let { files } = await readDirsDeep(this.#dir, localDir => !excludedDirs.has(path.basename(localDir)));

    files = files.filter(f => {
      return /(?<!\.d)\.mts$/.test(f);
    });

    if (files.length === 0)
      return;
    await this.#invokeTSCWithFiles(
      files, path.join(this.#dir, "tsconfig.json")
    );
  }

  async #invokeTSCWithFiles(
    files: string[],
    tsconfigPath: string
  ) : Promise<void>
  {
    const result = await InvokeTSC.withCustomConfiguration(
      tsconfigPath,
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
    const buildDir = path.resolve(this.#dir, "build");
    const pathToModule = path.resolve(buildDir, "support.mjs");
    const pathToMTS = path.resolve(buildDir, "support.mts");

    try {
      await fs.access(pathToMTS);
    }
    catch (ex) {
      // do nothing
      void(ex);
      return;
    }

    console.log("Compiling build:");
    {
      let { files: tsFiles } = await readDirsDeep(buildDir);
      tsFiles = tsFiles.filter(f => /(?<!\.d)\.mts$/.test(f));

      if (tsFiles.length > 0) {
        await this.#invokeTSCWithFiles(
          tsFiles,
          path.join(this.#dir, "build", "tsconfig.json")
        );
      }
    }

    console.log("Executing build:");
    const buildNext = (await import(pathToModule)).default as () => Promise<void>;
    await buildNext();
  }

  async #specBuild() : Promise<void>
  {
    const buildDir = path.resolve(this.#dir, "spec-build");
    const pathToModule = path.resolve(buildDir, "support.mjs");
    const pathToMTS = path.resolve(buildDir, "support.mts");

    try {
      await fs.access(pathToMTS);
    }
    catch (ex) {
      // do nothing
      void(ex);
      return;
    }

    console.log("Creating spec-generated:");
    const generatedDir = path.resolve(this.#dir, "spec-generated");
    await fs.mkdir(generatedDir, { recursive: true });

    const supportModule = (await import(pathToModule)).default as () => Promise<void>;
    await supportModule();

    console.log("Compiling spec-generated:");
    {
      let { files: tsFiles } = await readDirsDeep(generatedDir);
      tsFiles = tsFiles.filter(f => /(?<!\.d)\.mts$/.test(f));

      if (tsFiles.length > 0) {
        await this.#invokeTSCWithFiles(
          tsFiles, path.join(this.#dir, "spec-generated", "tsconfig.json")
        );
      }
    }
  }

  static readonly #subtasks = ["clean", "build", "tsc", "spec-build"];

  static buildTask(dir: string) : DirStage
  {
    const target = BPSet.get("stages");
    target.addSubtarget(dir);

    const stage = new DirStage(dir);
    stage.addSubtargets(dir);
    BPSet.get("clean").addSubtarget(dir + ":clean");

    return stage;
  }
}

{ // clean
  void(BPSet.get("clean"));
  const stages = BPSet.get("stages");
  stages.addSubtarget("clean");
}

{ // build:rebuild
  const copyFilesRecursively = async function(src: string, dest: string) : Promise<void>
  {
    const items = await readDirsDeep(src);
    await PromiseAllSequence(items.dirs, async dir => {
      dir = dir.replace(src, dest);
      await fs.mkdir(dir, { recursive: true });
    });

    await PromiseAllSequence(items.files, async srcFile => {
      const destFile = srcFile.replace(src, dest);
      await fs.copyFile(srcFile, destFile);
    });
  }

  const outerRebuild = BPSet.get("build:rebuild");
  const fullDir = path.resolve("build");
  void(new DirStage(fullDir));

  const innerClean   = BPSet.get(fullDir + ":clean");
  const innerRebuild = BPSet.get(fullDir + ":build");
  const innerTSC     = BPSet.get(fullDir + ":tsc");

  outerRebuild.addTask(async () => {
    const temp = await tempDirWithCleanup();
    await copyFilesRecursively(path.resolve("build"), temp.tempDir);

    try {
      await innerClean.run();
      await innerRebuild.run();
      await innerTSC.run();
    }
    catch (ex) {
      await fs.copyFile(path.resolve("build", "ts-stdout.txt"), path.resolve(temp.tempDir, "ts-stdout.txt"));
      await fs.copyFile(path.resolve("build", "tsconfig.json"), path.resolve(temp.tempDir, "tsconfig.json"));

      await copyFilesRecursively(temp.tempDir, path.resolve("build"));

      throw ex;
    }
    finally {
      temp.resolve(true);
      await temp.promise;
    }
  });
}

{ // stages
  void(BPSet.get("stages"));
  stageDirs.forEach(dir => DirStage.buildTask(dir));
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

/*
We're damned if we do and damned if we don't with this code:

try {
  // do something
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
catch (ex: any) {
  // do something else
}

The fix?

try {
  // do something
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
catch (ex: unknown) {
  if ((ex as Error).message === "foo")
    // do something else
}
*/

{ // eslint
  const target = BPSet.get("eslint");
  target.description = "eslint support";
  const args = [
    "--max-warnings=0"
  ];

  let dirs = stageDirs.slice();
  dirs.push(path.resolve("build"));

  dirs = await PromiseAllParallel(dirs, async (stageDir) => {
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

  target.addTask(
    async () => {
      await runModule("./node_modules/eslint/bin/eslint.js", args);
    }
  );
}

BPSet.markReady();
export default BPSet;
