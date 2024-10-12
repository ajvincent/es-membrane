import path from "node:path";

import {
  projectRoot,
  monorepoRoot,
} from "../source/constants.js";

it("projectRoot is correct", () => {
  expect(path.basename(projectRoot)).toBe("build-utilities");
});

it("monorepoRoot is correct", () => {
  expect(path.basename(monorepoRoot)).toBe("es-membrane");
});
