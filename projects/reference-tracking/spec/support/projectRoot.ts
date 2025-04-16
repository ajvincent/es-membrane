import path from "node:path";

import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

export const projectRoot = path.join(monorepoRoot, "projects/reference-tracking");
export const referenceSpecDir = path.join(projectRoot, "dist/reference-spec");

export function getReferenceSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, leafName);
}
