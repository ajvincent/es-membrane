import path from "node:path";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { projectRoot } from "../support/projectRoot.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("directInvoke works", async () => {
  const filePath = path.join(fixturesDir, "counter.js");
  const callback = jasmine.createSpy<(...values: string[]) => void>();
  await directInvoke(filePath, callback);
  expect(callback).toHaveBeenCalledTimes(10);

  expect(callback).toHaveBeenCalledWith("0");
  expect(callback).toHaveBeenCalledWith("1");
  expect(callback).toHaveBeenCalledWith("2");
  expect(callback).toHaveBeenCalledWith("3");
  expect(callback).toHaveBeenCalledWith("4");
  expect(callback).toHaveBeenCalledWith("5");
  expect(callback).toHaveBeenCalledWith("6");
  expect(callback).toHaveBeenCalledWith("7");
  expect(callback).toHaveBeenCalledWith("8");
  expect(callback).toHaveBeenCalledWith("9");
}, 1000 * 60 * 60);
