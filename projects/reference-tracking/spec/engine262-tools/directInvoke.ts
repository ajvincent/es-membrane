import path from "node:path";

import * as GuestEngine from "@engine262/engine262";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { projectRoot } from "../support/projectRoot.js";
import { GuestRealmOutputs } from "../../source/engine262-tools/types/Virtualization262.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("directInvoke works", async () => {
  const absolutePathToFile = path.join(fixturesDir, "counter.js");

  let counter = 0;
  const callback = jasmine.createSpy<
    (
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value,
    ) => GuestEngine.Value
  >();

  let failed = false;
  callback.and.callFake((
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value,
  ): GuestEngine.Value => {
    void(guestThisArg);
    void(guestNewTarget);

    if (failed)
      return GuestEngine.Value.undefined;

    const guestReportedArray = guestArguments[0];
    const guestValues: GuestEngine.Value[] = [];
    if (guestReportedArray.type !== "Object") {
      GuestEngine.Throw('TypeError', "NotAnObject", guestReportedArray);
      return GuestEngine.Value.undefined;
    }
    if (!GuestEngine.isArrayExoticObject(guestReportedArray)) {
      GuestEngine.Throw('TypeError', "NotATypeObject", guestReportedArray, "Array");
      return GuestEngine.Value.undefined;
    }

    const length: number = GuestEngine.LengthOfArrayLike(guestReportedArray);
    for (let index = 0; index < length; index++) {
      const key: GuestEngine.JSStringValue = GuestEngine.Value(index.toString());
      guestValues.push(GuestEngine.GetV(guestReportedArray, key));
    }

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
  const outputs: GuestRealmOutputs = await directInvoke({absolutePathToFile}, callback);

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(10);
}, 1000 * 60 * 60);
