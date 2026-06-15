import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

export const projectRoot = path.join(monorepoRoot, "projects/search-references");
export const referenceSpecDir = path.join(projectRoot, "dist/reference-spec");
export const guestSearchReferencesPath = path.join(projectRoot, "dist/guest/searchReferences.js");
export const guestSearchReferencesURL = pathToFileURL(guestSearchReferencesPath).href;

export function getReferenceSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, leafName);
}
