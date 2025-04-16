import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { asyncFork } from "./childProcess.js";
import { monorepoRoot, } from "./constants.js";
import { overwriteFileIfDifferent, } from "./overwriteFileIfDifferent.js";
const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");
export async function InvokeTSC(pathToTSConfig, excludesGlobs) {
    const configContents = {
        extends: pathToTSConfig,
        exclude: excludesGlobs,
    };
    if (excludesGlobs.length === 0) {
        Reflect.deleteProperty(excludesGlobs, "excludes");
    }
    const pathToBaseTSConfig = path.join(process.cwd(), "tsconfig.json");
    if (pathToTSConfig !== pathToBaseTSConfig) {
        await overwriteFileIfDifferent(true, JSON.stringify(configContents, null, 2) + "\n", path.join(process.cwd(), "tsconfig.json"));
    }
    try {
        await asyncFork(TSC, [], process.cwd());
    }
    catch (code) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        //console.warn(await fs.readFile(pathToStdOut, { encoding: "utf-8" }));
        throw new Error(`Failed on "${TSC}" with code ${code}`);
    }
}
export async function InvokeTSC_excludeDirs(projectRoot) {
    const filesToExclude = [];
    try {
        const excludesJSON = await fs.readFile(path.join(process.cwd(), "tsc-excludes.json"), { encoding: "utf-8" });
        filesToExclude.push(...JSON.parse(excludesJSON));
    }
    catch (ex) {
        void (ex);
    }
    return InvokeTSC(path.join(path.relative(process.cwd(), projectRoot), "tsconfig.json"), filesToExclude);
}
