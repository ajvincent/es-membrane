import { fork } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { monorepoRoot, } from "./constants.js";
import { overwriteFileIfDifferent, } from "./overwriteFileIfDifferent.js";
const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");
export async function InvokeTSC(pathToBaseTSConfig, excludesGlobs) {
    const configContents = {
        extends: pathToBaseTSConfig,
        exclude: excludesGlobs,
    };
    if (excludesGlobs.length === 0) {
        Reflect.deleteProperty(excludesGlobs, "excludes");
    }
    await overwriteFileIfDifferent(true, JSON.stringify(configContents, null, 2) + "\n", path.join(process.cwd(), "tsconfig.json"), new Date());
    const child = fork(TSC, [], {
        cwd: process.cwd(),
        stdio: ["ignore", "inherit", "inherit", "ipc"]
    });
    let p = new Promise((resolve, reject) => {
        child.on("exit", (code) => {
            code ? reject(code) : resolve(code);
        });
    });
    try {
        await p;
    }
    catch (code) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        //console.warn(await fs.readFile(pathToStdOut, { encoding: "utf-8" }));
        throw new Error(`Failed on "${TSC}" with code ${code}`);
    }
}
