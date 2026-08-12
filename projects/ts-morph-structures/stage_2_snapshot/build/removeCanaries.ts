import fs from "node:fs/promises";

import { PromiseAllParallel } from "#utilities/source/PromiseTypes.js";
import readDirsDeep from "#utilities/source/readDirsDeep.js";
import { snapshotDir } from "./constants.js";

export default async function removeCanaries(): Promise<void> {
  let { files } = (await readDirsDeep(snapshotDir));
  files = files.filter(f => f.endsWith("Canary.js") || f.endsWith("Canary.js.map"));
  await PromiseAllParallel(files, async f => {
    try {
      await fs.rm(f);
    }
    catch (ex) {
      void(ex);
    }
  });
}
