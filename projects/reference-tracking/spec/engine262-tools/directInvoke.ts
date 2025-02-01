import path from "node:path";

import * as GuestEngine from "@engine262/engine262";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { projectRoot } from "../support/projectRoot.js";
import { GuestRealmOutputs } from "source/engine262-tools/types/Virtualization262.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("directInvoke works", async () => {
  const absolutePathToFile = path.join(fixturesDir, "counter.js");

  let counter = 0;
  const callback = jasmine.createSpy<(values: GuestEngine.Value[]) => void>();

  let failed = false;
  callback.and.callFake((values: GuestEngine.Value[]) => {
    if (failed)
      return;

    expect(values.length).withContext(`iteration ${counter} argument length`).toBe(1);
    if (values.length !== 1) {
      failed = true;
      return;
    }

    const value: GuestEngine.Value = values[0];
    expect(value.type).withContext(`iteration ${counter} type`).toBe("Number");
    if (value.type !== "Number") {
      failed = true;
      return;
    }

    expect(value.numberValue()).withContext(`iteration ${counter} value`).toBe(counter);
    failed = value.numberValue() !== counter;
    counter++;
  });
  const outputs: GuestRealmOutputs = await directInvoke({absolutePathToFile}, callback);

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(10);
}, 1000 * 60 * 60);
