import fs from "node:fs/promises";
import path from "node:path";
const TS_MODULE_EXT_RE = /(?<!\.d)\.ts$/;
function isTSFile(d) {
    return d.isFile() && TS_MODULE_EXT_RE.test(d.name);
}
async function getDescendantFiles(projectRoot, topDir) {
    const dirPath = path.join(projectRoot, topDir);
    const descendants = await fs.readdir(dirPath, {
        encoding: "utf-8",
        withFileTypes: true,
        recursive: true,
    });
    return descendants.filter(isTSFile).map(d => path.join(d.path, d.name));
}
async function getTopDirFiles(projectRoot) {
    const topDirEntries = await fs.readdir(projectRoot, {
        encoding: "utf-8",
        withFileTypes: true,
        recursive: false,
    });
    return Promise.resolve(topDirEntries.filter(isTSFile).map(dirEnt => path.join(projectRoot, dirEnt.name)));
}
export async function cleanTSC_Output(projectRoot, topDirs) {
    const filePromises = topDirs.map(getDescendantFiles.bind(this, projectRoot));
    filePromises.unshift(getTopDirFiles(projectRoot));
    const allTSFiles = (await Promise.all(filePromises)).flat();
    const allCompiledFiles = allTSFiles.map(tsFile => [
        tsFile.replace(/\.ts$/, ".js"),
        tsFile.replace(/\.ts$/, ".d.ts"),
        tsFile.replace(/\.ts$/, ".js.map")
    ]).flat();
    await Promise.all(allCompiledFiles.map(cf => fs.rm(cf, { force: true })));
}
