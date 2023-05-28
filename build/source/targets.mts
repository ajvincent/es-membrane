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
    BPSet.get(dir + ":build").addTask(async () => await this.#beforeSourceBuild());
    BPSet.get(dir + ":tsc").addTask(async () => await this.#runTSC());
    BPSet.get(dir + ":spec-build").addTask(async () => await this.#specBuild());
    BPSet.get(dir + ":examples-build").addTask(async () => await this.#examplesBuild());
  }

  addSubtargets(dir: string) : void
  {
    const subtarget = BPSet.get(dir);
    DirStage.#subtasks.forEach(subtask => subtarget.addSubtarget(dir + ":" + subtask));
  }

  async #clean() : Promise<void>
  {
    const isBuildDir = this.#dir.includes("/build");
    const { files } = await readDirsDeep(
      this.#dir,
    );

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

    const excludedDirs = new Set([
      "build",
      "spec-generated",
      "examples"
    ]);
    if (excludeSpecBuild)
      excludedDirs.add("spec-build");

    await this.#invokeTSCWithDirFilter(
      this.#dir, path.join(this.#dir, "tsconfig.json"), localDir => !excludedDirs.has(path.basename(localDir))
    );
  }

  async #invokeTSCWithDirFilter(
    rootDir: string,
    tsconfigPath: string,
    filter?: ((value: string) => boolean)
  ) : Promise<void>
  {
    let { files } = await readDirsDeep(rootDir, filter);
    files = files.filter(f => {
      return /(?<!\.d)\.mts$/.test(f);
    });

    if (files.length === 0)
      return;

    await InvokeTSC.withCustomConfiguration(
      tsconfigPath,
      false,
      (config: {
        files?: string[],
        extends?: string
      }) => {
        config.files = files;
        config.extends = "@tsconfig/node18/tsconfig.json";
      },
      path.resolve(this.#dir, "ts-stdout.txt")
    );
  }

  async #beforeSourceBuild() : Promise<void>
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
    await this.#invokeTSCWithDirFilter(
      buildDir, path.join(buildDir, "tsconfig.json")
    );

    console.log("Executing build:");
    await importAndRun(pathToModule);
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

    await importAndRun(pathToModule);

    console.log("Compiling spec-generated:");
    await this.#invokeTSCWithDirFilter(
      generatedDir, path.join(this.#dir, "spec-generated", "tsconfig.json")
    );
  }

  async #examplesBuild() : Promise<void>
  {
    /* Three steps:
    (1) Compile examples/build
    (2) Run examples/build/support.mjs
    (3) Compile examples/* except for examples/build
    */

    const examplesDir = path.resolve(this.#dir, "examples");
    try {
      await fs.access(examplesDir);
    }
    catch (ex) {
      // do nothing
      void(ex);
      return;
    }

    {
      let foundBuildSupport = false;
      const pathToModule = path.resolve(examplesDir, "build/support.mjs");
      const pathToMTS = path.resolve(examplesDir, "build/support.mts");

      try {
        await fs.access(pathToMTS);
        foundBuildSupport = true;
      }
      catch (ex) {
        // do nothing
        void(ex);
      }

      if (foundBuildSupport) {
        console.log("Compiling examples/build:");
        const rootDir = path.dirname(pathToMTS);
        await this.#invokeTSCWithDirFilter(rootDir, path.join(rootDir, "tsconfig.json"));

        const generatedDir = path.join(examplesDir, "generated");
        await fs.rm(generatedDir, { recursive: true, force: true });

        console.log("Executing examples/build/support.mjs:");
        await importAndRun(pathToModule);
      }
    }

    console.log("Compiling examples (except for build):");
    await this.#invokeTSCWithDirFilter(
      examplesDir,
      path.join(examplesDir, "tsconfig.json"),
      localDir => path.basename(localDir) !== "build"
    );
  }

  static #subtasks: ReadonlyArray<string> = [
    "clean",
    "build",
    "tsc",
    "spec-build",
    "examples-build",
  ];

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

  const args = [
    "-c", "./.eslintrc.json",
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

{ // examples
  const target = BPSet.get("examples");

  stageDirs.forEach((stageDir) => {
    target.addTask(async () => {
      const pathToModule = path.resolve(stageDir, "examples/run.mjs");
      try {
        await fs.access(pathToModule);
      }
      catch (ex) {
        // do nothing
        void(ex);
        return;
      }

      console.log(`${stageDir}/examples/run.mjs`);
      await importAndRun(pathToModule);
    });
  });
}

async function importAndRun(pathToModule: string) : Promise<void>
{
  const module = (
    await import(pathToModule) as { default : () => Promise<void> }
  ).default as () => Promise<void>;
  await module();
}

BPSet.markReady();
export default BPSet;
