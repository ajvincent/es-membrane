import fs from "node:fs/promises";
import path from "node:path";
const TS_MODULE_EXT_RE = /(?<!\.d)\.ts$/;
export async function cleanTSC_output(projectRoot, localDirs) {
    const dirFilePromises = localDirs.map(async (localDir) => {
        const descendants = await fs.readdir(path.join(projectRoot, localDir), { encoding: "utf-8", withFileTypes: true });
        return descendants.filter(d => d.isFile() && TS_MODULE_EXT_RE.test(d.name)).map(d => path.join(projectRoot, localDir, d.name));
    });
    const allTSFiles = (await Promise.all(dirFilePromises)).flat();
    const allCompiledFiles = allTSFiles.map(tsFile => [
        tsFile.replace(/\.ts$/, ".js"),
        tsFile.replace(/\.ts$/, ".d.ts"),
        tsFile.replace(/\.ts$/, ".js.map")
    ]).flat().sort();
    await Promise.all(allCompiledFiles.map(cf => fs.rm(cf, { force: true })));
}
