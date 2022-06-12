import { BuildPromiseSet } from "./utilities/BuildPromise.mjs";
import { PromiseAllParallel, PromiseAllSequence } from "./utilities/PromiseTypes.mjs";
import { runModule } from "./utilities/runModule.mjs";
import InvokeTSC from "./utilities/InvokeTSC.mjs";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
import tempDirWithCleanup from "./utilities/tempDirWithCleanup.mjs";
import fs from "fs/promises";
import path from "path";
let stageDirs;
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
    stageDirs = await PromiseAllParallel(stageDirs, async (leaf) => {
        const fullPath = path.join(root, leaf);
        const entries = await fs.readdir(fullPath);
        return entries.length > 0 ? leaf : "";
    });
    stageDirs = stageDirs.filter(Boolean);
}
const BPSet = new BuildPromiseSet(true);
class DirStage {
    #dir;
    #allDirs;
    constructor(dir, allDirs) {
        this.#dir = path.resolve(dir);
        this.#allDirs = allDirs;
        BPSet.get(dir + ":clean").addTask(async () => await this.#clean());
        BPSet.get(dir + ":tsc").addTask(async () => await this.#runTSC());
        BPSet.get(dir + ":build").addTask(async () => await this.#runBuild());
    }
    addSubtargets(dir) {
        const subtarget = BPSet.get(dir);
        DirStage.#subtasks.forEach(subtask => subtarget.addSubtarget(dir + ":" + subtask));
    }
    async #clean() {
        const isBuildDir = this.#dir.includes("/build");
        let { files } = await readDirsDeep(this.#dir);
        files = files.filter(f => /(?<!\.d)\.mts$/.test(f));
        if (files.length === 0)
            return;
        files = files.flatMap(f => {
            return [
                !isBuildDir || f.includes("/build/spec/") ? f.replace(".mts", ".mjs") : "",
                f.replace(".mts", ".mjs.map"),
                f.replace(".mts", ".d.mts"),
            ];
        }).filter(Boolean);
        files.sort();
        await PromiseAllParallel(files, f => fs.rm(f, { force: true }));
    }
    async #runTSC() {
        let { files } = await readDirsDeep(this.#dir);
        const buildDir = path.join(this.#dir, "build");
        files = files.filter(f => {
            return /(?<!\.d)\.mts$/.test(f) && !f.startsWith(buildDir);
        });
        if (files.length === 0)
            return;
        const result = await InvokeTSC.withCustomConfiguration(path.join(this.#dir, "tsconfig.json"), false, (config) => {
            config.files = files;
            config.extends = "@tsconfig/node16/tsconfig.json";
        }, path.resolve(this.#dir, "ts-stdout.txt"));
        if (result !== 0)
            throw new Error("runTSC failed with code " + result);
    }
    async #runBuild() {
        const buildDir = path.resolve(this.#dir, "build");
        const pathToModule = path.resolve(buildDir, "support.mjs");
        try {
            await fs.access(pathToModule);
        }
        catch (ex) {
            // do nothing
            void (ex);
            return;
        }
        let { files: tsFiles } = await readDirsDeep(buildDir);
        tsFiles = tsFiles.filter(f => /(?<!\.d)\.mts$/.test(f));
        if (tsFiles.length > 0) {
            const result = await InvokeTSC.withCustomConfiguration(path.join(buildDir, "tsconfig.json"), false, (config) => {
                config.files = tsFiles;
                config.extends = "@tsconfig/node16/tsconfig.json";
            }, path.resolve(buildDir, "ts-stdout.txt"));
            if (result !== 0)
                throw new Error("runTSC failed with code " + result);
        }
        const buildNext = (await import(pathToModule)).default;
        await buildNext(this.#allDirs);
    }
    static #subtasks = ["clean", "build", "tsc"];
    static buildTask(dir, allDirs) {
        const target = BPSet.get("stages");
        target.addSubtarget(dir);
        const stage = new DirStage(dir, allDirs);
        stage.addSubtargets(dir);
        BPSet.get("clean").addSubtarget(dir + ":clean");
        return stage;
    }
}
{ // clean
    void (BPSet.get("clean"));
    const stages = BPSet.get("stages");
    stages.addSubtarget("clean");
}
{ // build:rebuild
    const copyFilesRecursively = async function (src, dest) {
        const items = await readDirsDeep(src);
        await PromiseAllSequence(items.dirs, async (dir) => {
            dir = dir.replace(src, dest);
            await fs.mkdir(dir, { recursive: true });
        });
        await PromiseAllSequence(items.files, async (srcFile) => {
            const destFile = srcFile.replace(src, dest);
            await fs.copyFile(srcFile, destFile);
        });
    };
    const outerRebuild = BPSet.get("build:rebuild");
    const fullDir = path.resolve("build");
    void (new DirStage(fullDir, []));
    const innerClean = BPSet.get(fullDir + ":clean");
    const innerRebuild = BPSet.get(fullDir + ":build");
    const innerTSC = BPSet.get(fullDir + ":tsc");
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
    void (BPSet.get("stages"));
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
    let dirs = stageDirs.slice();
    dirs.push(path.resolve("build"));
    dirs = await PromiseAllParallel(dirs, async (stageDir) => {
        const { files } = await readDirsDeep(path.resolve(stageDir));
        return files.some(f => f.endsWith(".mjs")) ? stageDir : "";
    });
    args.push(...dirs.filter(Boolean));
    target.addTask(async () => await runModule("./node_modules/eslint/bin/eslint.js", args));
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
        return files.some(f => f.endsWith(".mts")) ? stageDir : "";
    });
    args.push(...dirs.filter(Boolean));
    target.addTask(async () => {
        await runModule("./node_modules/eslint/bin/eslint.js", args);
    });
}
BPSet.markReady();
export default BPSet;
//# sourceMappingURL=targets.mjs.map