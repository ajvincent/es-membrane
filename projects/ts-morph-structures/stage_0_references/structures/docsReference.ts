import path from "node:path";
import {
  monorepoRoot
} from "@ajvincent/build-utilities";

const docsAsHTMLPath = path.normalize(path.join(
  monorepoRoot, "docs/ts-morph-structures/reference/structure-types.html"
));

const docsAsMDPath = path.normalize(path.join(
  monorepoRoot, "docs/ts-morph-structures/reference/structure-types.md"
));

export { docsAsHTMLPath, docsAsMDPath }
