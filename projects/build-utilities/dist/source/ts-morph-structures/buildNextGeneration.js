import fs from "node:fs/promises";
import path from "node:path";
import { PromiseAllParallel } from "../PromiseTypes.js";
import { asyncFork } from "../childProcess.js";
import { monorepoRoot } from "../constants.js";
const localRootSource = "ts-morph-structures";
const localRootTarget = "ts-morph-structures-next";
const allProjectsDir = path.join(monorepoRoot, "projects");
// #region cleanup before copying
{
    await asyncFork(path.join(allProjectsDir, localRootSource, "gulp-utilities/cleanTSC_output.js"), [], path.join(allProjectsDir, localRootSource));
    await PromiseAllParallel([
        "stage_2_generation/dist",
        "stage_2_integration/snapshot",
        "stage_3_generation/dist",
        "stage_3_integration/snapshot",
        "stage_3_snapshot/snapshot",
    ], (pathToDir) => fs.rm(path.join(allProjectsDir, localRootSource, pathToDir), { recursive: true, force: true }));
}
// #endregion cleanup before copying
//#region build directories structure
{
    const fileRoutingMap = new Map([
        ["dist", [doNothing, null]],
        ["gulp-utilities", [directCopyFile, null]],
        ["node_modules", [doNothing, null]],
        ["package.json", [modifyPackageJSON, null]],
        ["stage_0_references", [directCopyFile, null]],
        ["stage_1_snapshot", [doNothing, null]], // copied from stage_2
        ["stage_2_generation", [doNothing, null]], // copied from stage_3
        ["stage_2_integration", [directCopyFile, null]],
        ["stage_2_snapshot", [recurseOverFiles, "stage_1_snapshot"]],
        ["stage_2_snapshot/build", [doNothing, null]], // copied from stage_3
        ["stage_2_snapshot/fixtures", [directCopyFile, "stage_1_snapshot/fixtures"]],
        ["stage_2_snapshot/pre-build", [doNothing, null]], // copied from stage_3
        ["stage_2_snapshot/snapshot", [directCopyFile, "stage_1_snapshot/snapshot"]],
        ["stage_2_snapshot/spec-snapshot", [directCopyFile, "stage_1_snapshot/spec-snapshot"]],
        ["stage_2_snapshot/tsc-excludes.json", [directCopyFile, null]],
        ["stage_3_generation", [directCopyFile, "stage_2_generation"]],
        ["stage_3_integration", [directCopyFile, null]],
        ["stage_3_snapshot", [recurseOverFiles, null]],
        ["stage_3_snapshot/build", [directCopyFile, "stage_2_snapshot/build"]],
        ["stage_3_snapshot/pre-build", [directCopyFile, "stage_2_snapshot/pre-build"]],
        ["stage_3_snapshot/snapshot", [doNothing, null]],
        ["stage_3_snapshot/spec-snapshot", [directCopyFile, null]],
        ["stage_3_documentation", [directCopyFile, null]],
        ["use-cases", [directCopyFile, null]],
        ["utilities", [directCopyFile, null]],
    ]);
    await fs.mkdir(path.join(allProjectsDir, localRootTarget));
    await recurseOverFiles("", null);
    async function routeFile(localPath, teePath, leafName) {
        localPath = path.join(localPath, leafName);
        if (teePath)
            teePath = path.join(teePath, leafName);
        const [callback, teePathOverride] = fileRoutingMap.get(localPath) ?? [recurseOverFiles, teePath];
        teePath = teePathOverride;
        await callback(localPath, teePath);
    }
    function doNothing() {
        return Promise.resolve();
    }
    doNothing;
    function debugCallback(callback) {
        return function (localPath, teePath) {
            //eslint-disable-next-line no-debugger;
            debugger;
            return callback(localPath, teePath);
        };
    }
    void debugCallback;
    async function recurseOverFiles(localPath, teePath) {
        const filePath = path.join(allProjectsDir, localRootSource, localPath);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
            return await directCopyFile(localPath, teePath);
        }
        const files = await fs.readdir(filePath);
        await PromiseAllParallel(files, f => routeFile(localPath, teePath, f));
    }
    recurseOverFiles;
    async function directCopyFile(localPath, teePath) {
        const sourceFile = path.join(allProjectsDir, localRootSource, localPath);
        const targetFile = path.join(allProjectsDir, localRootTarget, localPath);
        let promises = [];
        promises.push(fs.cp(sourceFile, targetFile, { recursive: true }));
        if (teePath) {
            const teeFile = path.join(allProjectsDir, localRootTarget, teePath);
            promises.push(fs.cp(sourceFile, teeFile, { recursive: true }));
        }
        await Promise.all(promises);
    }
    directCopyFile;
    async function modifyPackageJSON(localPath) {
        const sourcePath = path.join(allProjectsDir, localRootSource, localPath);
        let contents = await fs.readFile(sourcePath, { encoding: "utf-8" });
        const packageJSON = JSON.parse(contents);
        packageJSON.name += "-next";
        packageJSON.private = true;
        contents = JSON.stringify(packageJSON, null, 2);
        const targetPath = path.join(allProjectsDir, localRootTarget, localPath);
        await fs.writeFile(targetPath, contents, { encoding: "utf-8" });
    }
    modifyPackageJSON;
}
//#endregion build directories structure
//#region fix file references
{
    const filesToRemove = [
        "stage_1_snapshot/spec-snapshot/build-checks/sourceNotInFiles.ts",
        "stage_1_snapshot/spec-snapshot/build-checks/import-dist.ts",
        "stage_1_snapshot/README.md",
    ];
    await PromiseAllParallel(filesToRemove, f => fs.rm(path.join(allProjectsDir, localRootTarget, f)));
    await Promise.all([
        replaceReferencesInDir([
            ["#stage_two", "#stage_one"],
        ], "stage_1_snapshot"),
        replaceReferencesInDir([
            ["#stage_two", "#stage_one"],
        ], "stage_2_generation"),
        replaceReferencesInDir([
            [
                "#stage_one/prototype-snapshot/exports.js",
                "#stage_one/snapshot/dist/exports.js"
            ]
        ], "stage_2_integration"),
    ]);
    async function replaceReferencesInDir(searches, pathToDir) {
        pathToDir = path.join(allProjectsDir, localRootTarget, pathToDir);
        const files = await fs.readdir(pathToDir, { recursive: true });
        await PromiseAllParallel(files, f => replaceReferenceInFile(searches, path.join(pathToDir, f)));
    }
    async function replaceReferenceInFile(searches, pathToFile) {
        const stats = await fs.stat(pathToFile);
        if (!stats.isFile())
            return;
        const original = await fs.readFile(pathToFile, { encoding: "utf-8" });
        let contents = original;
        for (const [needle, replace] of searches) {
            contents = contents.replaceAll(needle, replace);
        }
        if (contents !== original)
            await fs.writeFile(pathToFile, contents, { encoding: "utf-8" });
    }
}
//#endregion fix file references
