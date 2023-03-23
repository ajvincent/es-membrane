import { buildAspectClassRaw } from "../source/AspectDecorators.mjs";

import path from "path";
import url from "url";

export default async function runModule() : Promise<void>
{
  await buildAspectClassRaw(
    {
      exportName: "NumberStringType",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures",
      leafName: "NumberStringType.mjs"
    },
    {
      exportName: "NumberStringClass",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures",
      leafName: "NumberStringClass.mjs"
    },
    {
      "repeatForward": [
        ["s", "string"],
        ["n", "number"],
      ],

      "repeatBack": [
        ["n", "number"],
        ["s", "string"],
      ],
    },
    "NumberStringAspectClass",
    path.normalize(path.join(
      url.fileURLToPath(import.meta.url),
      "../../spec-generated/NumberStringAspectClass.mts"
    ))
  );
}
