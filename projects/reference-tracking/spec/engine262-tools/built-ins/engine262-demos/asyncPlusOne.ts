import path from "node:path";

import {
  GuestEngine,
} from "../../../../source/engine262-tools/host-to-guest/GuestEngine.js";

import { projectRoot } from "../../../support/projectRoot.js";

import { directInvoke } from "../../../../source/engine262-tools/host-to-guest/directInvoke.js";
import { defineReportFunction } from "../../../../source/engine262-tools/built-ins/engine262-demos/defineReportFunction.js";
import { GuestRealmOutputs } from "../../../../source/engine262-tools/types/Virtualization262.js";
import { defineAsyncPlusOneFunction } from "../../../../source/engine262-tools/built-ins/engine262-demos/defineAsyncPlusOneFunction.js";

const distFixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

xit("built-in functions returning promises can work", async () => {
  const absolutePathToFile = path.join(distFixturesDir, "asyncPlusOne.js");

  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => GuestEngine.Evaluator<GuestEngine.Value>
  >();

  let actualResult: number = NaN;
  // eslint-disable-next-line require-yield
  callback.and.callFake(function * (
    guestValues: readonly GuestEngine.Value[]
  ): GuestEngine.Evaluator<GuestEngine.Value>
  {
    expect(guestValues.length).toBe(1);
    if (guestValues.length !== 1)
      return GuestEngine.Value.undefined;

    const [value] = guestValues;
    expect(value.type).withContext("number type").toBe("Number");
    if (value.type !== "Number")
      return GuestEngine.Value.undefined;

    actualResult = value.numberValue();
    return GuestEngine.Value.undefined;
  });

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: function * (realm) {
      yield* defineReportFunction(realm, callback);
      yield* defineAsyncPlusOneFunction(realm);
    }
  });

  expect(outputs.succeeded).withContext("outputs.succeeded").toBeTrue();
  expect(outputs.unhandledPromises.length).withContext("unhandled promises").toBe(0);

  expect(callback).withContext("callback calls total").toHaveBeenCalledTimes(1);

  expect(actualResult).withContext("actualResult").toBe(10);
});
