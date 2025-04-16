import path from "node:path";
import { chdir, cwd, } from "node:process";
import { asyncFork } from "./childProcess.js";
import { monorepoRoot, } from "./constants.js";
import { InvokeTSC_excludeDirs, } from "./InvokeTSC.js";
const pathToGulp = path.join(monorepoRoot, "node_modules/gulp/bin/gulp.js");
export function recursiveGulp(projectRoot, localPathToDir) {
    const callback = () => invokeChildGulpFile(projectRoot, localPathToDir);
    callback.displayName = `<dir:${localPathToDir}>`;
    return callback;
}
async function invokeChildGulpFile(projectRoot, localPathToDir) {
    let targetDir = "";
    let previousDir;
    function pushd() {
        console.log(`pushd(${localPathToDir})`);
        previousDir = cwd();
        targetDir = path.normalize(path.join(previousDir, localPathToDir));
        chdir(targetDir);
        return Promise.resolve();
    }
    function popd() {
        console.log(`popd(${localPathToDir})`);
        chdir(previousDir);
        return Promise.resolve();
    }
    await pushd();
    try {
        await InvokeTSC_excludeDirs(projectRoot);
        await runChildGulpfile();
    }
    finally {
        await popd();
    }
}
async function runChildGulpfile() {
    try {
        await asyncFork(pathToGulp, [
            "--no-experimental-require-module",
            "--expose-gc",
        ], cwd());
    }
    catch (code) {
        throw new Error(`Failed on "${pathToGulp}" with code ${code}`);
    }
}
