import fs from "node:fs/promises";
import path from "node:path";
import URL from "node:url";

import {
  zip,
  type AsyncZippable,
  type FlateCallback,
} from "fflate";

import {
  PromiseAllParallel
} from "./PromiseTypes.js";

const stageDir = path.normalize(path.join(
  URL.fileURLToPath(import.meta.url), "../.."
));

async function getJSFilesList(dir: string): Promise<string[]> {
  let fileList: string[] = await fs.readdir(path.join(stageDir, dir), {recursive: true});
  fileList = fileList.filter(f => f.endsWith(".js")).map(f => path.join(dir, f));
  return fileList;
}

const files = (await Promise.all([
  getJSFilesList("references"),
  getJSFilesList("source"),
])).flat();

async function getPackageZippable(file: string): Promise<[string, Uint8Array]> {
  const buffer: Buffer = await fs.readFile(path.join(stageDir, file));
  const binaryArray: Uint8Array = new Uint8Array(buffer);
  return [path.join("packages/stage-utilities", file), binaryArray];
}

const zippableEntries: AsyncZippable = Object.fromEntries(await PromiseAllParallel(files, getPackageZippable));
let zipUint8: Uint8Array<ArrayBuffer>;
{
  const deferred = Promise.withResolvers<Uint8Array<ArrayBuffer>>();
  const resultFn: FlateCallback = (err, zipped) => {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve(zipped);
  };

  zip(zippableEntries, resultFn);
  zipUint8 = await deferred.promise;
}
console.log(Reflect.ownKeys(zippableEntries));

const destination: string = path.join(stageDir, "exported-references.zip");
await fs.writeFile(destination, zipUint8);
