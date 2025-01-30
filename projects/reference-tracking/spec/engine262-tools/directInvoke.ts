import path from "node:path";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { projectRoot } from "../support/projectRoot.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

xit("directInvoke works", async () => {
  const filePath = path.join(fixturesDir, "counter.js");
  const callback = jasmine.createSpy<(...values: string[]) => void>();
  await directInvoke(filePath, callback);
  expect(callback).toHaveBeenCalledTimes(10);
  expect(callback).toHaveBeenCalledOnceWith("0");
}, 1000 * 60 * 60);
