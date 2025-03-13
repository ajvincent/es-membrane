import path from "node:path";

import {
  GuestEngine,
  type ThrowOr,
} from "../../../../source/engine262-tools/host-to-guest/GuestEngine.js";

import { projectRoot } from "../../../support/projectRoot.js";

import { directInvoke } from "../../../../source/engine262-tools/host-to-guest/directInvoke.js";
import { defineReportFunction } from "../../../../source/engine262-tools/built-ins/engine262-demos/defineReportFunction.js";
import { GuestRealmOutputs } from "../../../../source/engine262-tools/types/Virtualization262.js";
import { defineEchoFunctions } from "../../../../source/engine262-tools/built-ins/engine262-demos/defineEchoFunctions.js";
import { EnsureValueOrThrow } from "../../../../source/engine262-tools/host-to-guest/ValueOrThrow.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

it("echo functions can work", async () => {
  const absolutePathToFile = path.join(fixturesDir, "echo.js");
  const callback = jasmine.createSpy<
    (
      guestValues: readonly GuestEngine.Value[],
    ) => GuestEngine.Value | GuestEngine.ThrowCompletion
  >();

  callback.and.callFake((
    guestValues: readonly GuestEngine.Value[],
  ): ThrowOr<GuestEngine.Value> => {
    expect(guestValues.length).toBe(1);
    if (guestValues.length !== 1)
      return GuestEngine.Value.undefined;
    const [value] = guestValues;
    expect(value.type).withContext(`object type`).toBe("Object");
    if (value.type !== "Object")
      return GuestEngine.Value.undefined;

    const guestResults = EnsureValueOrThrow(GuestEngine.GetV(value, GuestEngine.Value("results")));
    expect(guestResults.type).withContext("results type").toBe("Object");
    if (guestResults.type !== "Object")
      return GuestEngine.Value.undefined;

    expect(guestResults.OwnPropertyKeys()).withContext("results keys").toEqual([
      GuestEngine.Value("_null"),
      GuestEngine.Value("_false"),
      GuestEngine.Value("three"),
      GuestEngine.Value("string_"),
      GuestEngine.Value("Five"),
    ]);

    expect(
      GuestEngine.GetV(guestResults, GuestEngine.Value("_null"))
    ).withContext("results._null").toBe(GuestEngine.Value.null);
    expect(
      GuestEngine.GetV(guestResults, GuestEngine.Value("_false"))
    ).withContext("results._false").toBe(GuestEngine.Value.false);
    expect(
      GuestEngine.GetV(guestResults, GuestEngine.Value("three"))
    ).withContext("results.three").toEqual(GuestEngine.Value(3));
    expect(
      GuestEngine.GetV(guestResults, GuestEngine.Value("string_"))
    ).withContext("results.string_").toEqual(GuestEngine.Value("my string_"));
    expect(
      GuestEngine.GetV(guestResults, GuestEngine.Value("Five"))
    ).withContext("results.Five").toEqual(GuestEngine.Value(BigInt(5)));

    return GuestEngine.Value.undefined;
  });

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm) => {
      defineReportFunction(realm, callback);
      defineEchoFunctions(realm);
    },
  });

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(1);
});
