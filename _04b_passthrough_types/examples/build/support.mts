import path from "path";
import url from "url";

import ProjectDriver from "../../source/ProjectDriver.mjs";

export default async function() : Promise<void> {
  await ProjectDriver(
    path.resolve(url.fileURLToPath(import.meta.url), "../NumberString.json"),
    false
  );
}
