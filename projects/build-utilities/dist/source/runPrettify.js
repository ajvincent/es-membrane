import fs from "fs/promises";
import * as prettier from "prettier";
import { PromiseAllParallel } from "./PromiseTypes.js";
import { readDirsDeep } from "./readDirsDeep.js";
export async function runPrettify(absolutePath) {
    const { files } = await readDirsDeep(absolutePath);
    await PromiseAllParallel(files.filter(file => file.endsWith(".ts")), reformatFile);
}
async function reformatFile(pathToFile) {
    let source = await fs.readFile(pathToFile, { encoding: "utf-8" });
    const options = {};
    if (pathToFile.endsWith(".ts"))
        options.parser = "typescript";
    source = await prettier.format(source, options);
    await fs.writeFile(pathToFile, source, { encoding: "utf-8" });
}
