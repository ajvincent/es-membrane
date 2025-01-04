import path from "path";
import fs from "fs/promises";

import { docsAsMDPath } from "./docsReference.js";
import TypeWithDependencies from "./TypeWithDependencies.js";

export default async function buildStructuresReference(): Promise<void> {
  await TypeWithDependencies.run();

  await Promise.all([
    (async () : Promise<void> => {
      await fs.mkdir(path.dirname(docsAsMDPath), { recursive: true });
      const contents = TypeWithDependencies.buildMarkdownSource();
      await fs.writeFile(docsAsMDPath, contents, { encoding: "utf-8" });
    })(),
  ])

}
