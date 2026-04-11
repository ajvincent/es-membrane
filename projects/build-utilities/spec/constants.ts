import path from "node:path";

import {
  projectRoot,
  monorepoRoot,
  TYPESCRIPT_LIBS_PATH,
} from "../source/constants.js";

it("projectRoot is correct", () => {
  expect(path.basename(projectRoot)).toBe("build-utilities");
});

it("monorepoRoot is correct", () => {
  expect(path.basename(monorepoRoot)).toBe("es-membrane");
});

it("TYPESCRIPT_LIBS_PATH is correct", () => {
  expect(path.basename(TYPESCRIPT_LIBS_PATH)).toBe("lib");
});
