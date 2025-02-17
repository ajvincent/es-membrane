import path from "node:path";

import {
  GuestEngine,
  type ThrowOr
} from "../../source/engine262-tools/GuestEngine.js";

import { projectRoot } from "../support/projectRoot.js";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { defineReportFunction } from "../../source/engine262-tools/built-ins/defineReportFunction.js";
import { GuestRealmOutputs } from "../../source/engine262-tools/types/Virtualization262.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("directInvoke works", async () => {
  const absolutePathToFile = path.join(fixturesDir, "counter.js");

  let counter = 0;
  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => ThrowOr<GuestEngine.Value>
  >();

  let failed = false;
  callback.and.callFake((
    guestValues: readonly GuestEngine.Value[],
  ): ThrowOr<GuestEngine.Value> => {
    if (failed)
      return GuestEngine.Value.undefined;

    expect(guestValues.length).withContext(`iteration ${counter} argument length`).toBe(1);
    if (guestValues.length !== 1) {
      failed = true;
      return GuestEngine.Value.undefined;
    }

    const value: GuestEngine.Value = guestValues[0];
    expect(value.type).withContext(`iteration ${counter} type`).toBe("Number");
    if (value.type !== "Number") {
      failed = true;
      return GuestEngine.Value.undefined;
    }

    expect(value.numberValue()).withContext(`iteration ${counter} value`).toBe(counter);
    failed = value.numberValue() !== counter;
    counter++;
    return GuestEngine.Value.undefined;
  });
  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm) => {
      defineReportFunction(realm, callback);
    },
  });

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(10);
});

it("directInvoke throws when it doesn't get an array argument", async () => {
  const absolutePathToFile = path.join(fixturesDir, "throwOnReport.js");
  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => ThrowOr<GuestEngine.Value>
  >();

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm) => {
      defineReportFunction(realm, callback);
    },
  });

  expect(outputs.succeeded).toBeFalse();
  expect(outputs.unhandledPromises.length).withContext("unhandled promises").toBe(1); // for the thrown exception

  expect(callback).withContext("callback").toHaveBeenCalledTimes(0);
});
