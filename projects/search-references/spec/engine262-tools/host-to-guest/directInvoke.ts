import path from "node:path";

import {
  GuestEngine,
} from "../../../source/engine262-tools/host-to-guest/GuestEngine.js";

import {
  projectRoot
} from "../../support/projectRoot.js";

import {
  runInRealm
} from "../../../source/engine262-tools/host-to-guest/runInRealm.js";

import {
  defineReportFunction
} from "../../../source/engine262-tools/built-ins/engine262-demos/defineReportFunction.js";

import {
  GuestRealmOutputs
} from "../../../source/engine262-tools/types/Virtualization262.js";

import {
  SpecGuestRealmInputs
} from "../../support/SpecGuestRealmInputs.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("directInvoke works", async () => {
  const absolutePathToFile = path.join(fixturesDir, "counter.js");

  let counter = 0;
  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => GuestEngine.Evaluator<GuestEngine.Value>
  >();

  let failed = false;
  // eslint-disable-next-line require-yield
  callback.and.callFake(function * (
    guestValues: readonly GuestEngine.Value[],
  ): GuestEngine.Evaluator<GuestEngine.Value> {
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

  function * defineBuiltIns(realm: GuestEngine.ManagedRealm) {
    yield * defineReportFunction(realm, callback);
  }

  const inputs = new SpecGuestRealmInputs(absolutePathToFile, defineBuiltIns);
  const outputs: GuestRealmOutputs = await runInRealm(inputs);

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(10);
});

it("directInvoke throws when it doesn't get an array argument", async () => {
  const absolutePathToFile = path.join(fixturesDir, "throwOnReport.js");
  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => GuestEngine.Evaluator<GuestEngine.Value>
  >();

  function * defineBuiltIns(realm: GuestEngine.ManagedRealm) {
    yield * defineReportFunction(realm, callback);
  }
  const inputs = new SpecGuestRealmInputs(absolutePathToFile, defineBuiltIns)
  const outputs: GuestRealmOutputs = await runInRealm(inputs);

  expect(outputs.succeeded).toBeFalse();
  expect(outputs.unhandledPromises.length).withContext("unhandled promises").toBe(1); // for the thrown exception

  expect(callback).withContext("callback").toHaveBeenCalledTimes(0);
});
